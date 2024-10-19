<script>
  import { onMount } from 'svelte';
  import { user } from '../../authstore';
  import { goto } from '$app/navigation';
  import { geminiInference } from '../../geminiInference';
  import { db } from '../../firebase';
  import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
  import { marked } from 'marked';
  import { checkPlagiarism } from '../../plagiarismChcker';

  let purposeTag = '';
  let referenceText = '';
  let referenceTextSummary = '';
  let takeaways = '';
  let newTakeaway = '';
  let exampleOutput = '';
  let plagiarismText = '';
  let userQuestion = '';
  let summarizationProgress = 0;
  let takeawayType = 'mix';
  let dataLoaded = false;
  let price = 0;
  let link = '';
  let plagiarismResults = '';
  let isPlagiarismChecking = false;

  onMount(async () => {
    if (!$user) {
      goto('/login');
    } else {
      await fetchUserData();
      dataLoaded = true;
    }
  });

  async function fetchUserData() {
    if ($user) {
      const docRef = doc(db, 'users', $user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        purposeTag = docSnap.data().purposeTag || '';
        takeaways = docSnap.data().takeaways || '';
        price = docSnap.data().price || 0;
        link = docSnap.data().link || '';
      } else {
        try {
          await setDoc(docRef, { purposeTag: '', takeaways: '', price: 0, link: '' });
          console.log("New user document created");
        } catch (e) {
          console.error("Error creating user document: ", e);
        }
      }
    }
  }

  async function updateUserData() {
    if ($user && dataLoaded) {
      const docRef = doc(db, 'users', $user.uid);
      try {
        await updateDoc(docRef, { purposeTag, takeaways, price, link });
        console.log("User data updated successfully");
      } catch (e) {
        console.error("Error updating user data: ", e);
      }
    }
  }

  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const text = await file.text();
      referenceText = text;
      await summarizeAndMapTopics(text);
    }
  }

  async function summarizeAndMapTopics(text) {
    const chunkSize = 5000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    let summaries = [];
    for (let i = 0; i < chunks.length; i++) {
      const summary = await geminiInference(`Summarize the following text:\n\n${chunks[i]}`);
      summaries.push(summary);
      summarizationProgress = ((i + 1) / chunks.length) * 100;
    }

    const finalSummaryPrompt = `Create a concise summary that outlines the main topics, key concepts, and overarching themes from these section summaries. Focus on the big picture and avoid specific details:\n\n${summaries.join('\n\n')}`;
    referenceTextSummary = await geminiInference(finalSummaryPrompt);
    summarizationProgress = 100;
  }

  async function generateNewTakeaway() {
    const prompt = `Based on the following reference text summary and existing takeaways, suggest a new takeaway that:
1. Focuses on overarching concepts and valuable lessons learned
2. Avoids specific sentences or details
3. Provides insights that can be applied broadly
4. Connects ideas from different parts of the text
5. Highlights any paradigm shifts or key realizations

Reference text summary:
${referenceTextSummary}

Existing takeaways:
${takeaways}

Please provide a concise, insightful takeaway that meets these criteria.`;
    
    newTakeaway = await geminiInference(prompt);
  }

  async function updateTakeaways() {
    if ($user) {
      const docRef = doc(db, 'users', $user.uid);
      try {
        await updateDoc(docRef, { takeaways });
        console.log("Takeaways updated successfully");
      } catch (e) {
        console.error("Error updating takeaways: ", e);
      }
    }
  }

  async function generateExampleOutput() {
    if (!userQuestion) {
      alert("Please enter a question or task first.");
      return;
    }
    const prompt = `Based on the following takeaways and user question/task, generate an example output that demonstrates how to apply the key concepts and insights:

Takeaways:
${takeaways}

User question/task:
${userQuestion}

Please provide a thoughtful and practical response that showcases the application of the takeaways.`;
    
    exampleOutput = await geminiInference(prompt);
  }

  function handlePlagiarismFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      file.text().then(text => plagiarismText = text);
    }
  }

  async function performPlagiarismCheck() {
    if (!exampleOutput || !plagiarismText) {
      alert("Please ensure both the model output and comparison text are provided.");
      return;
    }

    isPlagiarismChecking = true;
    const results = await checkPlagiarism(plagiarismText, exampleOutput);
    
    // Highlight plagiarized sentences in blue
    let highlightedText = exampleOutput;
    results.forEach(sentence => {
      const escapedSentence = sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
      const regex = new RegExp(`(${escapedSentence})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<span style="background-color: #e6f3ff;">$1</span>');
    });

    plagiarismResults = highlightedText;
    isPlagiarismChecking = false;
  }

  function renderMarkdown(text) {
    return marked(text);
  }

  function acceptTakeaway() {
    if (takeawayType === 'mix') {
      takeaways += `\n\n${newTakeaway}`;
    } else {
      takeaways = newTakeaway;
    }
    updateTakeaways();
    newTakeaway = '';
  }

  function handlePurposeTagChange() {
    if (dataLoaded) {
      updateUserData();
    }
  }

  function handleTakeawaysChange() {
    if (dataLoaded) {
      updateUserData();
    }
  }

  function updatePrice() {
    if (dataLoaded) {
      updateUserData();
    }
  }

  function handleLinkChange() {
    if (dataLoaded) {
      updateUserData();
    }
  }
</script>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-4xl mb-4 text-purple-800 font-bold">{$user?.displayName}'s Dashboard</h1>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Reference Docs</h2>
        <input type="file" on:change={handleFileUpload} accept=".txt,.pdf" class="mb-4" />
        {#if summarizationProgress > 0 && summarizationProgress < 100}
          <div class="mt-4">
            <p class="text-purple-600">Summarizing: {summarizationProgress.toFixed(2)}%</p>
            <div class="w-full bg-purple-200 rounded-full h-2.5 dark:bg-purple-700">
              <div class="bg-purple-600 h-2.5 rounded-full" style="width: {summarizationProgress}%"></div>
            </div>
          </div>
        {/if}
        <div class="mt-4 p-4 bg-gray-100 rounded max-h-96 overflow-auto relative">
          {@html renderMarkdown(referenceTextSummary || referenceText)}
          {#if (referenceTextSummary || referenceText).length > 5000}
            <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-100 to-transparent"></div>
          {/if}
        </div>
      </section>

      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Purpose/Tag</h2>
        <textarea
          bind:value={purposeTag}
          on:change={handlePurposeTagChange}
          placeholder="Describe the purpose or tag for the agent here"
          class="w-full h-20 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></textarea>
      </section>

      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Agent Price</h2>
        <div class="flex items-center">
          <input 
            id="price" 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            bind:value={price} 
            on:input={updatePrice} 
            class="w-3/4 h-4 bg-purple-200 rounded-lg cursor-pointer"
          >
          <div class="ml-4 bg-purple-100 text-purple-800 px-4 py-2 rounded-lg">
            <span class="font-bold">{price}</span> eth
          </div>
        </div>
      </section>

      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Link</h2>
        <input
          type="url"
          bind:value={link}
          on:change={handleLinkChange}
          placeholder="Enter a link here"
          class="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </section>
    </div>

    <div>
      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Takeaways</h2>
        <textarea
          bind:value={takeaways}
          on:change={handleTakeawaysChange}
          class="w-full h-40 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></textarea>
        <button on:click={generateNewTakeaway} class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300">
          Generate New Takeaway
        </button>
        {#if newTakeaway}
          <div class="mt-4 p-4 bg-purple-100 rounded-lg shadow">
            <p class="font-semibold text-purple-800">New Takeaway Suggestion:</p>
            <div class="mt-2 text-purple-900">{@html renderMarkdown(newTakeaway)}</div>
            <div class="mt-2 flex space-x-4">
              <label class="inline-flex items-center">
                <input type="radio" bind:group={takeawayType} value="mix" checked class="form-radio text-purple-600" />
                <span class="ml-2">Combine with existing takeaways</span>
              </label>
              <label class="inline-flex items-center">
                <input type="radio" bind:group={takeawayType} value="new" class="form-radio text-purple-600" />
                <span class="ml-2">Replace existing takeaways</span>
              </label>
            </div>
            <button on:click={acceptTakeaway} class="bg-purple-500 text-white px-4 py-2 rounded mt-4 hover:bg-purple-600 transition duration-300">
              Accept Takeaway
            </button>
          </div>
        {/if}
      </section>

      <section class="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Example Output</h2>
        <textarea
          bind:value={userQuestion}
          placeholder="Enter your question or task here"
          class="w-full h-20 p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></textarea>
        <button on:click={generateExampleOutput} class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300">
          Generate Example Output
        </button>
        <div class="mt-4 p-4 bg-gray-800 rounded text-white overflow-x-auto">
          <pre><code>{@html renderMarkdown(exampleOutput)}</code></pre>
        </div>
      </section>
    </div>
  </div>

  <section class="mb-8 bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl mb-4 text-purple-700 font-semibold">Plagiarism Check</h2>
    <div class="flex flex-col md:flex-row">
      <div class="w-full md:w-1/2 pr-0 md:pr-2 mb-4 md:mb-0">
        <h3 class="text-xl mb-2 text-purple-600">Upload File for Comparison</h3>
        <input type="file" on:change={handlePlagiarismFileUpload} accept=".txt" class="mb-2" />
        <textarea
          bind:value={plagiarismText}
          placeholder="Content for plagiarism check"
          class="w-full h-40 p-2 border rounded mt-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
        ></textarea>
      </div>
    </div>
    <div class="mt-4">
      <button 
        on:click={performPlagiarismCheck} 
        class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition duration-300"
        disabled={isPlagiarismChecking}
      >
        {isPlagiarismChecking ? 'Checking...' : 'Check for Plagiarism'}
      </button>
    </div>
    {#if plagiarismResults}
      <div class="mt-4">
        <h3 class="text-xl mb-2 text-purple-600">Plagiarism Check Results</h3>
        <div class="border border-gray-300 rounded p-2 max-h-60 overflow-y-auto bg-white">
          {@html plagiarismResults}
        </div>
      </div>
    {/if}
  </section>
</div>

<style>
  :global(body) {
    background-color: #f3e8ff;
  }
  
  :global(pre) {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
