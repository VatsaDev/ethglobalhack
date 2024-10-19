<svelte:head>
  <title>Search</title>
  <link rel="icon" type="image" href="/favicon.png">
</svelte:head>

<h1 class="text-center text-8xl m-4 mb-10">Find your <span style="color: #7D12D5">Agent</span> </h1>

<script>
  let price = 0; // Initial price value

  // Function to handle the slider input
  function updatePrice(event) {
    price = parseFloat(event.target.value).toFixed(2);
  }
</script>

<div class="grid grid-cols-1 justify-center items-center">
  <!-- Search Bar -->
  <div class="items-center m-4">
    <input type="text" placeholder="Search..." class="border border-gray-300 p-2 rounded-l w-11/12">
    <button class="bg-slate-200 hover:bg-slate-700 text-white p-2 rounded-r">
        🔍
    </button>
  </div>

  <!-- Price Slider with display box -->
  <div class=" grid grid-cols-2 items-center mr-4">
    <div>
    <label for="price" class="m-4">Price:</label>
    <input id="price" type="range" min="0" max="1" step="0.01" bind:value={price} on:input={updatePrice} class="w-3/4 h-4 bg-purple-600 rounded-lg cursor-pointer">
    </div>

  
    <div class="ml-4 bg-purple-100 text-purple-800 px-4 my-4 py-2 rounded-lg w-1/2">
      <span>{price}</span> eth
    </div>
  </div>
</div>

<!--search logic here-->
