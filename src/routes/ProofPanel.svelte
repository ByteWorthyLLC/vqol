<script lang="ts">
  import { onMount } from 'svelte';
  import { inspectOfflineStatus, offlineReadinessScore } from '../lib/offline/status';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onback: () => void;
  }

  let { t, onback }: Props = $props();

  const checks = [
    ['proof.check.local.title', 'proof.check.local.body'],
    ['proof.check.telemetry.title', 'proof.check.telemetry.body'],
    ['proof.check.offline.title', 'proof.check.offline.body'],
    ['proof.check.aggregate.title', 'proof.check.aggregate.body'],
  ] as const;

  let offlineScore = $state<number | undefined>(undefined);
  let cacheCount = $state(0);
  let online = $state(true);

  onMount(() => {
    void inspectOfflineStatus().then((status) => {
      offlineScore = offlineReadinessScore(status);
      cacheCount = status.cacheNames.length;
      online = status.online;
    });
  });
</script>

<section>
  <header class="page-header">
    <span class="eyebrow">{t('lab.eyebrow')}</span>
    <h1>{t('proof.title')}</h1>
    <p class="lede">{t('proof.body')}</p>
  </header>

  <div class="checks">
    {#each checks as check}
      <article class="check">
        <span class="mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-11"/></svg>
        </span>
        <div>
          <h2>{t(check[0])}</h2>
          <p class="muted">{t(check[1])}</p>
        </div>
      </article>
    {/each}
  </div>

  <div class="commands">
    <h2>{t('proof.commands.title')}</h2>
    <code>npm run verify</code>
    <code>npm run audit:telemetry</code>
  </div>

  <div class="offline">
    <h2>{t('proof.offline.title')}</h2>
    <p class="muted">
      {offlineScore === undefined
        ? t('home.loading')
        : t('proof.offline.body', { score: offlineScore, caches: cacheCount, online: online ? t('proof.online') : t('proof.offline') })}
    </p>
  </div>

  <button onclick={onback}>{t('lab.back')}</button>
</section>

<style>
  .page-header {
    margin-bottom: var(--space-6);
  }
  .page-header .lede {
    margin: 0;
  }
  .checks {
    display: grid;
    gap: var(--space-3);
    margin: var(--space-2) 0 var(--space-6);
  }
  .check {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: var(--space-3);
    align-items: start;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    box-shadow: var(--shadow-sm);
  }
  .mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--success-soft);
    color: var(--success);
  }
  .check h2,
  .commands h2,
  .offline h2 {
    font-size: var(--text-base);
    margin: 0 0 var(--space-1);
  }
  .commands {
    border-top: 1px solid var(--border);
    padding-top: var(--space-4);
    margin: var(--space-6) 0;
    display: grid;
    gap: var(--space-2);
  }
  .commands code {
    display: block;
    overflow-x: auto;
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--surface-2);
    border: 1px solid var(--border);
    font-size: var(--text-sm);
  }
  .offline {
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin: var(--space-4) 0 var(--space-6);
  }
</style>
