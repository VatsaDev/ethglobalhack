<script>
import { user } from '../../authStore';
import { goto } from '$app/navigation';

// Redirect to login page if user is not authenticated
$: if ($user === null) {
  goto('/login');
}
</script>

<svelte:head>
  <title>Dashboard</title>
  <link rel="icon" type="image" href="/favicon.png">
</svelte:head>

{#if $user}
  <h1 class="m-4 text-8xl">{$user.displayName}'s agent:</h1>
  <div class="m-4">
     <h2 class="text-4xl">Recent Orders:</h2>
     [add orders here]
  </div>
  <div class="m-4">
    <h2 class="text-4xl">Agent Data:</h2>
    <h2 class="m-4 text-2xl">Reference Docs:</h2>
    <h2 class="m-4 text-2xl">Model takeaways:</h2>
    <h2 class="m-4 text-2xl">Example test:</h2>
    <h2 class="m-4 text-2xl">Plagarism checks:</h2>
  </div>
{:else}
  <p>Loading...</p>
{/if}
