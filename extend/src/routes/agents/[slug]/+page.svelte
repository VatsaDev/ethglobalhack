<script>
  import { onMount } from "svelte";
  import { doc, getDoc } from "firebase/firestore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { db } from "../../../firebase";
  import { geminiInference } from "../../../geminiInference";

  export let data;

  let currentUser = null;
  let agent = null;
  let loading = true;
  let error = null;
  let transactionStatus = null;
  let inferenceResult = null;
  let questionInput = "";
  let mode_test = true;

  const auth = getAuth();

  $: isOwnProfile = currentUser && agent && currentUser.email === agent.email;

  async function fetchUserData(email) {
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  }

  async function callBackendAPI(userWalletAddress, agentWalletAddress, price) {
    try {
      console.log(`Calling backend API with addresses: ${userWalletAddress} and ${agentWalletAddress} and price: ${price}`);

      const response = await fetch('https://cb36ff06-96d8-40e0-bc9c-09c534784a46-00-1u6izaycunmi2.kirk.replit.dev/wallet/transaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userWalletAddress, agentWalletAddress, price }),
      });

      if (!response.ok) {
        throw new Error(`Backend API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Backend API response:`, result);

      return result.success;
    } catch (error) {
      console.error(`Error calling backend API:`, error);
      return false;
    }
  }

  async function handleWalletInteraction() {
    if (agent && currentUser) {
      console.log(`Performing wallet interaction between user ${currentUser.walletAddress} and agent ${agent.walletAddress}`);
      transactionStatus = await callBackendAPI(currentUser.walletAddress, agent.walletAddress, agent.price);
      
      if (mode_test || transactionStatus) {
        const inputForInference = `Agent purpose: ${agent.purpose}, Price: ${agent.price} ETH, Question: ${questionInput}`;
        inferenceResult = await geminiInference(inputForInference);
        console.log(`Gemini inference result:`, inferenceResult);
      }
    }
  }

  onMount(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        currentUser = await fetchUserData(user.email);
        console.log("Current user data:", currentUser);
      }

      try {
        const agentData = await fetchUserData(data.slug);
        if (agentData) {
          agent = agentData;
          console.log(`Agent data fetched:`, agent);
        } else {
          error = "Agent not found";
          console.error(error);
        }
      } catch (e) {
        error = "Error fetching agent data";
        console.error("Error:", e);
      } finally {
        loading = false;
      }
    });
  });

  function formatInferenceResult(result) {
    let formattedResult = result;
    const lines = formattedResult.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let output = '';
    let boldCount = 0;

    console.log(lines);

    lines.forEach(line => {
      if (line.includes('**')) {
        const parts = line.split('**');
        parts.forEach(part => {
          if (part) {
            if (boldCount % 2 === 0) {
              output += `<strong>${part}</strong>`;
            } else {
              output += part;
            }
            boldCount++;
          }
        });
      } else if (line.startsWith('* ')) {
        output += `<li>${line.slice(2)}</li>`;
      } else {
        output += `<p>${line}</p>`;
      }
    });

    output = `<ul>${output}</ul>`;
    return output;
  }
</script>

<svelte:head>
  <title>{agent ? agent.purpose : "Agent"} Details</title>
  <link rel="icon" type="image" href="/favicon.png" />
</svelte:head>

{#if loading}
  <p class="text-center mt-8 text-gray-600">
    Loading agent details...
  </p>
{:else if error}
  <p class="text-center mt-8 text-red-600">{error}</p>
{:else if agent}
  <div class="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold mb-4">{agent.purposeTag}</h1>
    <div class="grid grid-cols-2 gap-4">
      <div>
        <p class="text-gray-600 font-semibold">Price:</p>
        <p class="text-purple-600 font-bold">{agent.price} ETH</p>
      </div>
      <div>
        <p class="text-gray-600 font-semibold">Purpose Tag:</p>
        <p>{agent.purposeTag}</p>
      </div>
      <div class="col-span-2">
        <p class="text-gray-600 font-semibold">Link:</p>
        <a
          href={agent.link}
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-500 hover:underline">{agent.link}</a
        >
      </div>
    </div>

    {#if !isOwnProfile}
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
    {:else}
      <p class="mt-4 text-gray-600">This is your own profile.</p>
    {/if}
  </div>
{/if}
