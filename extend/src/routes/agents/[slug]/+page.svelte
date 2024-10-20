
<script>
  import { onMount } from "svelte";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "../../../firebase";
  import { geminiInference } from "../../../geminiInference"; // Assume this is the correct import

  export let data;

  let user = null;
  let loading = true;
  let error = null;
  let transactionStatus = null;
  let inferenceResult = null;
  let questionInput = ""; // For user input
  let mode_test = false; // Set to true for testing

  async function callBackendAPI(agentWalletAddress, price) {
    try {
      console.log(`Calling backend API with address: ${agentWalletAddress} and price: ${price}`);

      const response = await fetch('https://cb36ff06-96d8-40e0-bc9c-09c534784a46-00-1u6izaycunmi2.kirk.replit.dev/wallet/transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentWalletAddress, price }),
      });

      if (!response.ok) {
        throw new Error(`Backend API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Backend API response:`, result);

      // Check if the result indicates success
      if (result.success) {
        console.log(`Transaction successful: ${result.message}`);
        return true;
      } else {
        console.error(`Transaction failed: ${result.message}`);
        return false;
      }
    } catch (error) {
      console.error(`Error calling backend API:`, error);
      return false;
    }
  }

  async function handleWalletInteraction() {
    if (user) {
      console.log(`Performing wallet interaction for user:`, user);
      transactionStatus = await callBackendAPI(user.coinbaseWalletAddress, user.price);
      
      if (mode_test) {
        // Run Gemini inference immediately if mode_test is true
        const inputForInference = `Agent purpose: ${user.purpose}, Price: ${user.price} ETH, Question: ${questionInput}`;
        inferenceResult = await geminiInference(inputForInference);
        console.log(`Gemini inference result (test mode):`, inferenceResult);
      } else if (transactionStatus) {
        // Run Gemini inference only if the transaction is successful
        const inputForInference = `Agent purpose: ${user.purpose}, Price: ${user.price} ETH, Question: ${questionInput}`;
        inferenceResult = await geminiInference(inputForInference);
        console.log(`Gemini inference result (after success):`, inferenceResult);
      }
    }
  }

  onMount(async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", data.slug));
      if (userDoc.exists()) {
        user = { id: userDoc.id, ...userDoc.data() };
        console.log(`User data fetched:`, user);
      } else {
        error = "User not found";
        console.error(error);
      }
    } catch (e) {
      error = "Error fetching user data";
      console.error("Error:", e);
    } finally {
      loading = false;
    }
  });



 function formatInferenceResult(result) {
    let formattedResult = result;

    // Split the result into lines
    const lines = formattedResult.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let output = '';
    let boldCount = 0; // Count to manage odd/even bold replacement

   console.log(lines)

    lines.forEach(line => {
      // Replace double asterisks with bold formatting
      if (line.includes('**')) {
        const parts = line.split('**');
        parts.forEach(part => {
          if (part) {
            // Check for odd/even bolding
            if (boldCount % 2 === 0) {
              output += `<strong>${part}</strong>`;
            } else {
              output += part;
            }
            boldCount++;
          }
        });
      } else if (line.startsWith('* ')) {
        // Replace bullet point
        output += `<li>${line.slice(2)}</li>`;
      } else {
        // Just a normal line
        output += `<p>${line}</p>`;
      }
    });

    // Wrap bullet points in <ul>
    output = `<ul>${output}</ul>`;

    return output;
  }
</script>

<svelte:head>
  <title>{user ? user.purpose : "Agent"} Details</title>
  <link rel="icon" type="image" href="/favicon.png" />
</svelte:head>

{#if loading}
  <p class="text-center mt-8 text-gray-600">
    Loading agent details...
  </p>
{:else if error}
  <p class="text-center mt-8 text-red-600">{error}</p>
{:else if user}
  <div class="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold mb-4">{user.purposeTag}</h1>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-gray-600 font-semibold">Price:</p>
        <p class="text-purple-600 font-bold">{user.price} ETH</p>
      </div>
      <div>
        <p class="text-gray-600 font-semibold">Purpose Tag:</p>
        <p>{user.purposeTag}</p>
      </div>
      <div class="col-span-2">
        <p class="text-gray-600 font-semibold">Link:</p>
        <a
          href={user.link}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline">{user.link}</a
        >
      </div>
    </div>

    <!-- Input for question -->
    <div class="mt-4">
      <label for="question" class="text-gray-600 font-semibold">Your Question:</label>
      <input
        id="question"
        type="text"
        bind:value={questionInput}
        class="w-full border rounded p-2"
        placeholder="Type your question here..."
      />
    </div>

    <button on:click={handleWalletInteraction} class="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded">
      Make Wallet Payment
    </button>

    {#if transactionStatus !== null}
      <div class="mt-4">
        <p class="text-gray-600 font-semibold">Transaction Status:</p>
        <p class={transactionStatus ? "text-green-600" : "text-red-600"}>
          {transactionStatus ? "Transaction Successful" : "Transaction Failed"}
        </p>
      </div>
    {/if}

    {#if inferenceResult}
      <div class="mt-4">
        <p class="text-gray-600 font-semibold">Gemini Inference Result:</p>
        <div>
          {@html formatInferenceResult(inferenceResult)}
        </div>
      </div>
    {/if}
  </div>
{/if}
