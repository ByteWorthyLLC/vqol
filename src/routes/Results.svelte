<script lang="ts">
  import { onMount } from 'svelte';
  import { listScores } from '../lib/storage/db';
  import type { ScoreRecord } from '../lib/storage/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onhome: () => void;
  }

  let { t, onhome }: Props = $props();

  let scores = $state<ScoreRecord[]>([]);
  let loading = $state(true);

  onMount(async () => {
    scores = await listScores();
    loading = false;
  });

  const latest = $derived(scores[scores.length - 1]);
  const prior = $derived(scores.length >= 2 ? scores[scores.length - 2] : undefined);
  const qolDelta = $derived(
    latest && prior ? +(latest.qolTscore - prior.qolTscore).toFixed(1) : undefined
  );
  const symDelta = $derived(
    latest && prior ? +(latest.symTscore - prior.symTscore).toFixed(1) : undefined
  );

  function formatDelta(d: number | undefined): string {
    if (d === undefined) return '';
    const sign = d > 0 ? '+' : '';
    return t('results.delta', { sign, value: d });
  }

  function fmtDate(ts: number): string {
    return new Date(ts).toLocaleDateString();
  }
</script>

<section>
  {#if loading}
    <p class="muted">{t('home.loading')}</p>
  {:else if !latest}
    <h1>{t('results.empty.title')}</h1>
    <p>{t('results.empty.body')}</p>
    <button class="primary" onclick={onhome}>{t('results.back')}</button>
  {:else}
    <h1>{t('results.title')}</h1>
    <p class="muted">{t('results.subtitle', { date: fmtDate(latest.calculatedAt) })}</p>

    <div class="scores">
      <div class="score-card">
        <span class="label">{t('results.qol.label')}</span>
        <span class="value">{latest.qolTscore}</span>
        <span class="delta">{formatDelta(qolDelta)}</span>
      </div>
      <div class="score-card">
        <span class="label">{t('results.sym.label')}</span>
        <span class="value">{latest.symTscore}</span>
        <span class="delta">{formatDelta(symDelta)}</span>
      </div>
    </div>

    <p class="share">{t('results.share')}</p>

    <div class="actions">
      <button class="primary" onclick={onhome}>{t('results.back')}</button>
    </div>

    {#if scores.length > 1}
      <details>
        <summary>{t('results.history.summary', { count: scores.length })}</summary>
        <ul>
          {#each scores.slice().reverse() as s (s.id)}
            <li>
              {t('results.history.entry', {
                date: fmtDate(s.calculatedAt),
                qol: s.qolTscore,
                sym: s.symTscore,
              })}
            </li>
          {/each}
        </ul>
      </details>
    {/if}
  {/if}
</section>

<style>
  .scores {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  @media (min-width: 480px) {
    .scores {
      grid-template-columns: 1fr 1fr;
    }
  }
  .score-card {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .label {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .value {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
  }
  .delta {
    font-size: 0.95rem;
    color: var(--muted);
  }
  .share {
    margin-top: 1.5rem;
    padding: 0.75rem 1rem;
    background: color-mix(in oklab, var(--accent) 8%, transparent);
    border-radius: 8px;
  }
  .actions {
    margin: 1.5rem 0;
  }
  details {
    margin-top: 2rem;
    border-top: 1px solid var(--border);
    padding-top: 1rem;
  }
  summary {
    cursor: pointer;
    font-weight: 600;
    padding: 0.5rem 0;
  }
  ul {
    padding-left: 1.25rem;
    margin: 0.5rem 0 0;
  }
  li {
    margin: 0.25rem 0;
  }
</style>
