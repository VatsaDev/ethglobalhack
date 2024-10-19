<svelte:head>
  <title>Extend</title>
  <link rel="icon" type="image" href="/favicon.png">
</svelte:head>

<div class="grid grid-cols-2">
  <div class="h-screen">
    <div class="h-1/2 bg-slate-100">
      <img src="/favicon.png" alt="logo" width="200px" style="margin-left:auto; margin-right:auto; padding-top: 70px">
    </div>
    <div class="h-1/2" style="background: url('/slinkpic.png'); background-size: cover; background-position: center; background-repeat: no-repeat; width: 100%;">
    </div>
  </div>
  <div class="h-screen">
    <h1 class="text-center mt-auto mb-auto text-8xl font-bold" style="margin-top:40%; background: linear-gradient(90deg, rgba(125,18,213,1) 0%, rgba(177,57,187,1) 45%, rgba(107,230,255,1) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      Æxtend
    </h1>  
  </div>
</div>

{#if showModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="relative bg-white rounded-lg shadow-[0_10px_50px_rgba(177,57,187,0.5),0_5px_15px_rgba(107,230,255,0.3)] md:w-3/4 lg:w-1/2" style="width: 90%; height: 90%">
            <button on:click={closeModal} class="absolute top-4 right-4 text-gray-700 hover:text-gray-900 focus:outline-none text-3xl">
                &times;
            </button>
            <div class="w-full p-4">
                <div>
                    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width: 95%; height: 85vh; padding-top:10px; border-radius: 30px"></iframe>
                </div>
            </div>
        </div>
    </div>
{/if}

<script>
    let showModal = true; // Opens modal by default
    function closeModal() {
        showModal = false;
    }
</script>
