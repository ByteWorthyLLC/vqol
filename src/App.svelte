<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './routes/Home.svelte';
  import Survey from './routes/Survey.svelte';
  import Results from './routes/Results.svelte';
  import LocaleSwitcher from './routes/LocaleSwitcher.svelte';
  import {
    loadPracticeConfig,
    applyBrandingToDocument,
  } from './lib/practice-config/load';
  import { loadMessages, makeT, preferredLocale } from './lib/i18n/loader';
  import type { PracticeConfig } from './lib/practice-config/types';
  import type { Locale } from './lib/storage/types';

  type Route = 'home' | 'survey' | 'results';

  let route = $state<Route>('home');
  let config = $state<PracticeConfig | undefined>(undefined);
  let locale = $state<Locale>('en');
  let t = $state<(k: string, p?: Record<string, string | number>) => string>(
    (k) => `[${k}]`
  );
  let bootError = $state<string>('');

  function parseHash(): Route {
    const h = window.location.hash.replace(/^#\/?/, '');
    if (h === 'survey') return 'survey';
    if (h === 'results') return 'results';
    return 'home';
  }

  function navigate(next: Route): void {
    window.location.hash = `#/${next}`;
  }

  async function applyLocale(next: Locale): Promise<void> {
    const messages = await loadMessages(next);
    t = makeT(messages);
    locale = next;
    document.documentElement.lang = next;
  }

  onMount(() => {
    const onHashChange = (): void => {
      route = parseHash();
    };

    void (async () => {
      try {
        const cfg = await loadPracticeConfig();
        applyBrandingToDocument(cfg);
        config = cfg;
        await applyLocale(
          preferredLocale(cfg.locale.default, cfg.locale.available)
        );
        route = parseHash();
        window.addEventListener('hashchange', onHashChange);
      } catch (err) {
        bootError = err instanceof Error ? err.message : String(err);
      }
    })();

    return () => window.removeEventListener('hashchange', onHashChange);
  });
</script>

{#if bootError}
  <main class="boot-error" role="alert">
    <h1>Configuration error</h1>
    <pre>{bootError}</pre>
    <p class="muted">
      Edit <code>public/practice.json</code> per the schema in
      <code>src/lib/practice-config/types.ts</code>.
    </p>
  </main>
{:else if !config}
  <main><p class="muted">Loading…</p></main>
{:else}
  <header>
    <div class="brand">
      <button class="logo" onclick={() => navigate('home')} aria-label={config.practiceName}>
        {config.practiceName}
      </button>
      <span class="muted">{t('app.tagline')}</span>
      {#if route !== 'survey' && config.locale.available.length > 1}
        <span class="spacer"></span>
        <LocaleSwitcher
          current={locale}
          available={config.locale.available}
          onchange={(next) => { void applyLocale(next); }}
        />
      {/if}
    </div>
  </header>

  <main>
    {#if route === 'home'}
      <Home {t} onstart={() => navigate('survey')} onview={() => navigate('results')} />
    {:else if route === 'survey'}
      <Survey {t} {locale} oncomplete={() => navigate('results')} oncancel={() => navigate('home')} />
    {:else}
      <Results {t} onhome={() => navigate('home')} />
    {/if}
  </main>

  <footer>
    <p class="muted">
      {t('footer.privacy')} ·
      <a href="https://github.com/ByteWorthyLLC/vqol" rel="noopener">github.com/ByteWorthyLLC/vqol</a>
    </p>
  </footer>
{/if}

<style>
  header {
    border-bottom: 1px solid var(--border);
    padding: 1rem;
  }
  .brand {
    max-width: var(--max-content);
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .spacer {
    flex: 1;
  }
  .logo {
    font-weight: 700;
    font-size: 1.15rem;
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
  .boot-error {
    color: var(--danger);
  }
  .boot-error pre {
    background: var(--border);
    color: var(--fg);
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.85rem;
  }
</style>
