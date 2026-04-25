<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './routes/Home.svelte';
  import Survey from './routes/Survey.svelte';
  import Results from './routes/Results.svelte';

  type Route = 'home' | 'survey' | 'results';

  let route = $state<Route>('home');

  function parseHash(): Route {
    const h = window.location.hash.replace(/^#\/?/, '');
    if (h === 'survey') return 'survey';
    if (h === 'results') return 'results';
    return 'home';
  }

  function navigate(next: Route): void {
    window.location.hash = `#/${next}`;
  }

  onMount(() => {
    route = parseHash();
    const onHashChange = (): void => {
      route = parseHash();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });
</script>

<header>
  <div class="brand">
    <button class="logo" onclick={() => navigate('home')} aria-label="vqol — home">
      vqol
    </button>
    <span class="muted">VEINES-QOL/Sym tracker</span>
  </div>
</header>

<main>
  {#if route === 'home'}
    <Home onstart={() => navigate('survey')} onview={() => navigate('results')} />
  {:else if route === 'survey'}
    <Survey oncomplete={() => navigate('results')} oncancel={() => navigate('home')} />
  {:else}
    <Results onhome={() => navigate('home')} />
  {/if}
</main>

<footer>
  <p class="muted">
    Local-only · No telemetry · MIT-licensed ·
    <a href="https://github.com/ByteWorthyLLC/vqol" rel="noopener">github.com/ByteWorthyLLC/vqol</a>
  </p>
</footer>

<style>
  header {
    border-bottom: 1px solid var(--border);
    padding: 1rem;
  }
  .brand {
    max-width: var(--max-content);
    margin: 0 auto;
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }
  .logo {
    font-weight: 700;
    font-size: 1.25rem;
    background: transparent;
    border: none;
    padding: 0;
    color: var(--accent);
    cursor: pointer;
    min-height: auto;
  }
  footer {
    border-top: 1px solid var(--border);
    padding: 1rem;
    text-align: center;
  }
  footer p {
    margin: 0;
  }
  footer a {
    color: var(--muted);
  }
</style>
