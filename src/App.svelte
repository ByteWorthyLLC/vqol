<script lang="ts">
  import { onMount } from 'svelte';
  import Home from './routes/Home.svelte';
  import Survey from './routes/Survey.svelte';
  import Results from './routes/Results.svelte';
  import Lab from './routes/Lab.svelte';
  import ProofPanel from './routes/ProofPanel.svelte';
  import ForkProof from './routes/ForkProof.svelte';
  import Studio from './routes/Studio.svelte';
  import Forge from './routes/Forge.svelte';
  import LaunchKit from './routes/LaunchKit.svelte';
  import Poster from './routes/Poster.svelte';
  import DeviceLab from './routes/DeviceLab.svelte';
  import LocaleSwitcher from './routes/LocaleSwitcher.svelte';
  import InAppReminderBanner from './routes/InAppReminderBanner.svelte';
  import SwUpdatePrompt from './routes/SwUpdatePrompt.svelte';
  import {
    loadPracticeConfig,
    applyBrandingToDocument,
  } from './lib/practice-config/load';
  import { loadMessages, makeT, preferredLocale } from './lib/i18n/loader';
  import type { PracticeConfig } from './lib/practice-config/types';
  import type { Locale } from './lib/storage/types';

  type Route =
    | 'home'
    | 'survey'
    | 'results'
    | 'lab'
    | 'proof'
    | 'fork'
    | 'studio'
    | 'forge'
    | 'launch'
    | 'poster'
    | 'device';
  interface ParsedLocation {
    route: Route;
    demo: boolean;
  }

  let route = $state<Route>('home');
  let demoMode = $state(false);
  let config = $state<PracticeConfig | undefined>(undefined);
  let locale = $state<Locale>('en');
  let t = $state<(k: string, p?: Record<string, string | number>) => string>(
    (k) => `[${k}]`
  );
  let bootError = $state<string>('');

  function parseLocationHash(): ParsedLocation {
    const raw = window.location.hash.replace(/^#\/?/, '');
    const [path = '', query = ''] = raw.split('?');
    const params = new URLSearchParams(query);
    const demo = params.get('demo') === '1';
    if (path === 'survey') return { route: 'survey', demo };
    if (path === 'results') return { route: 'results', demo };
    if (path === 'lab') return { route: 'lab', demo };
    if (path === 'proof') return { route: 'proof', demo };
    if (path === 'fork') return { route: 'fork', demo };
    if (path === 'studio') return { route: 'studio', demo };
    if (path === 'forge') return { route: 'forge', demo };
    if (path === 'launch') return { route: 'launch', demo };
    if (path === 'poster') return { route: 'poster', demo };
    if (path === 'device') return { route: 'device', demo };
    return { route: 'home', demo: false };
  }

  function setRouteFromHash(): void {
    const parsed = parseLocationHash();
    route = parsed.route;
    demoMode = parsed.demo;
  }

  function navigate(next: Route, opts: { demo?: boolean } = {}): void {
    const query = opts.demo ? '?demo=1' : '';
    window.location.hash = `#/${next}${query}`;
  }

  async function applyLocale(next: Locale): Promise<void> {
    const messages = await loadMessages(next);
    t = makeT(messages);
    locale = next;
    document.documentElement.lang = next;
  }

  onMount(() => {
    const onHashChange = (): void => {
      setRouteFromHash();
    };

    void (async () => {
      try {
        const cfg = await loadPracticeConfig();
        applyBrandingToDocument(cfg);
        config = cfg;
        await applyLocale(
          preferredLocale(cfg.locale.default, cfg.locale.available)
        );
        setRouteFromHash();
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
      {#if route !== 'survey'}
        <nav class="top-nav" aria-label="Project tools">
          <button onclick={() => navigate('lab')}>{t('nav.lab')}</button>
          <button onclick={() => navigate('studio')}>{t('nav.studio')}</button>
          <button onclick={() => navigate('launch')}>{t('nav.launch')}</button>
          <button onclick={() => navigate('proof')}>{t('nav.proof')}</button>
        </nav>
        <span class="spacer"></span>
        {#if config.locale.available.length > 1}
          <LocaleSwitcher
            current={locale}
            available={config.locale.available}
            onchange={(next) => { void applyLocale(next); }}
          />
        {/if}
      {/if}
    </div>
  </header>

  <SwUpdatePrompt {t} busy={route === 'survey'} />

  <main>
    {#if route === 'home'}
      <InAppReminderBanner {t} onstart={() => navigate('survey')} />
      <Home
        {t}
        onstart={() => navigate('survey')}
        onview={() => navigate('results')}
        ondemo={() => navigate('results', { demo: true })}
        onlab={() => navigate('lab')}
        onstudio={() => navigate('studio')}
        onlaunch={() => navigate('launch')}
      />
    {:else if route === 'survey'}
      <Survey
        {t}
        {locale}
        {config}
        oncomplete={() => navigate('results')}
        oncancel={() => navigate('home')}
      />
    {:else if route === 'lab'}
      <Lab
        {t}
        ondemo={() => navigate('results', { demo: true })}
        onproof={() => navigate('proof')}
        onfork={() => navigate('fork')}
        onstudio={() => navigate('studio')}
        onforge={() => navigate('forge')}
        onlaunch={() => navigate('launch')}
        onposter={() => navigate('poster')}
        ondevice={() => navigate('device')}
        onhome={() => navigate('home')}
      />
    {:else if route === 'proof'}
      <ProofPanel {t} onback={() => navigate('lab')} />
    {:else if route === 'fork'}
      <ForkProof {t} {config} onback={() => navigate('lab')} />
    {:else if route === 'studio'}
      <Studio {t} onback={() => navigate('lab')} onforge={() => navigate('forge')} />
    {:else if route === 'forge'}
      <Forge {t} {config} onback={() => navigate('lab')} onposter={() => navigate('poster')} />
    {:else if route === 'launch'}
      <LaunchKit
        {t}
        onback={() => navigate('lab')}
        onstudio={() => navigate('studio')}
        onforge={() => navigate('forge')}
      />
    {:else if route === 'poster'}
      <Poster {t} {config} onback={() => navigate('lab')} />
    {:else if route === 'device'}
      <DeviceLab
        {t}
        onback={() => navigate('lab')}
        onresults={() => navigate('results', { demo: true })}
      />
    {:else}
      <Results {t} {config} demo={demoMode} onhome={() => navigate('home')} onlab={() => navigate('lab')} />
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
  .top-nav {
    display: none;
    gap: 0.4rem;
    align-items: center;
  }
  .top-nav button {
    min-height: 36px;
    padding: 0.4rem 0.65rem;
    font-size: 0.9rem;
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
  @media (min-width: 640px) {
    .top-nav {
      display: flex;
    }
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
