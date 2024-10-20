<svelte:head>
  <title>Search</title>
  <link rel="icon" type="image" href="/favicon.png">
</svelte:head>

<h1 class="text-center text-8xl m-4 mb-10">Find your <span style="color: #7D12D5">Agent</span></h1>

<script>
  import { onMount } from 'svelte';
  import { collection, getDocs } from 'firebase/firestore';
  import { db } from '../../firebase'; // Adjust this import based on your Firebase setup

  let price = 0;
  let searchTerm = '';
  let users = [];
  let searchResults = [];

  onMount(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      price: doc.data().price,
      purpose: doc.data().purposeTag,
      link: doc.data().link
    }));
  });

  function updatePrice(event) {
    price = parseFloat(event.target.value).toFixed(2);
    searchUsers();
  }

  function searchUsers() {
    if (searchTerm.trim() === '' && price === 0) {
      searchResults = [];
      return;
    }

    const searchWords = searchTerm.toLowerCase().split(' ');
    searchResults = users.filter(user => 
      (searchWords.some(word => user.purpose.toLowerCase().includes(word)) || searchTerm.trim() === '') &&
      parseFloat(user.price) <= price
    );
  }

  $: {
    searchUsers();
  }
</script>

<div class="grid grid-cols-1 justify-center items-center">
  <!-- Search Bar -->
  <div class="items-center m-4">
    <input 
      type="text" 
      placeholder="Search..." 
      bind:value={searchTerm}
      on:input={searchUsers}
      class="border border-gray-300 p-2 rounded-l w-11/12"
    >
    <button class="bg-slate-200 hover:bg-slate-700 text-white p-2 rounded-r">
      🔍
    </button>
  </div>

  <!-- Price Slider with display box -->
  <div class="grid grid-cols-2 items-center mr-4">
    <div>
      <label for="price" class="m-4">Price:</label>
      <input 
        id="price" 
        type="range" 
        min="0" 
        max="1" 
        step="0.01" 
        bind:value={price} 
        on:input={updatePrice} 
        class="w-3/4 h-4 bg-purple-600 rounded-lg cursor-pointer"
      >
    </div>
    <div class="ml-4 bg-purple-100 text-purple-800 px-4 my-4 py-2 rounded-lg w-1/2">
      <span>{price}</span> eth
    </div>
  </div>
</div>

<!-- Search Results -->
{#if searchResults.length > 0}
  <div class="mt-8 mx-4">
    <h2 class="text-2xl font-bold mb-4">Search Results:</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each searchResults as user}
        <div class="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
          <div>
            <a href=/agents/{user.id}><p class="text-gray-600 font-bold">{user.purpose}</p></a>
          </div>
          <p class="text-purple-600 font-bold">{user.price} eth</p>
        </div>
      {/each}
    </div>
  </div>
{:else if searchTerm.length > 0 || price > 0}
  <div class="mt-8 mx-4">
    <p class="text-gray-600">No results found for the given search criteria.</p>
  </div>
{/if}

