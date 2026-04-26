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
  <h1>{t('proof.title')}</h1>
  <p>{t('proof.body')}</p>

  <div class="checks">
    {#each checks as check}
      <article class="check">
        <span class="mark" aria-hidden="true">OK</span>
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
  .checks {
    display: grid;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  .check {
    display: grid;
    grid-template-columns: 44px 1fr;
    gap: 0.75rem;
    align-items: start;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    border-radius: 8px;
    background: color-mix(in oklab, var(--accent) 12%, transparent);
    color: var(--accent);
    font-weight: 700;
    font-size: 0.85rem;
  }
  .check h2,
  .commands h2,
  .offline h2 {
    font-size: 1.05rem;
    margin-bottom: 0.25rem;
  }
  .commands {
    border-top: 1px solid var(--border);
    padding-top: 1rem;
    margin: 1.5rem 0;
    display: grid;
    gap: 0.5rem;
  }
  code {
    display: block;
    overflow-x: auto;
    padding: 0.65rem 0.75rem;
    border-radius: 8px;
    background: var(--border);
  }
  .offline {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0 1.5rem;
  }
</style>
