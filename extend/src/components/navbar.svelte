<script>
import { user } from '../authstore';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { goto } from '$app/navigation';

async function logout() {
  try {
    await signOut(auth);
    goto('/'); // Redirect to home page after logout
  } catch (error) {
    console.error("Error during sign out:", error);
  }
}
</script>

<nav class="bg-white shadow-lg p-4">
    <div class="container mx-auto flex justify-between items-center">
        <div class="flex space-x-4">
            <a href="/" class="text-gray-700 hover:underline font-medium">Home</a>
            <a href="/dash" class="text-gray-700 hover:underline font-medium">Dashboard</a>
            <a href="/search" class="text-gray-700 hover:underline font-medium">Search</a>
        </div>
        
        <div>
          {#if $user}
            <span class="mr-4">{$user.displayName}</span>
            <button on:click={logout} class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          {:else}
            <a href="/login">
              <button class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                Login
              </button>
            </a>
          {/if}
        </div>
    </div>
</nav>
