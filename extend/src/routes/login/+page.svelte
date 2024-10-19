<script>
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase';
import { goto } from '$app/navigation';

async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
    goto('/dash'); // Redirect to dashboard after successful login
  } catch (error) {
    console.error("Error during sign in:", error);
    // Handle error (e.g., show error message to user)
  }
}
</script>

<h1 class="text-center text-8xl p-6">Login</h1>

<button 
    on:click={signInWithGoogle}
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-4 rounded flex items-center ml-auto mr-auto"
  >
    <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path fill="#ffffff" d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
    </svg>
    Sign in with Google
</button>
