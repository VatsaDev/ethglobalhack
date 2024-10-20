<script>
  import "../app.css";
  import Navbar from '../components/navbar.svelte'

  export let data;
  export let form = null;

</script>

<Navbar />

<slot />
