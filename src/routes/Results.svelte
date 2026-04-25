<script lang="ts">
  import { onMount } from 'svelte';
  import { listScores } from '../lib/storage/db';
  import type { ScoreRecord } from '../lib/storage/types';

  interface Props {
    onhome: () => void;
  }

  let { onhome }: Props = $props();

  let scores = $state<ScoreRecord[]>([]);
  let loading = $state(true);

  onMount(async () => {
    scores = await listScores();
    loading = false;
  });

  const latest = $derived(scores[scores.length - 1]);
  const prior = $derived(scores.length >= 2 ? scores[scores.length - 2] : undefined);
  const qolDelta = $derived(latest && prior ? +(latest.qolTscore - prior.qolTscore).toFixed(1) : undefined);
  const symDelta = $derived(latest && prior ? +(latest.symTscore - prior.symTscore).toFixed(1) : undefined);

  function formatDelta(d: number | undefined): string {
    if (d === undefined) return '';
    const sign = d > 0 ? '+' : '';
    return `(${sign}${d} vs prior)`;
  }
</script>

<section>
  {#if loading}
    <p class="muted">Loading…</p>
  {:else if !latest}
    <h1>No results yet</h1>
    <p>Once you complete a survey, your scores will appear here.</p>
    <button class="primary" onclick={onhome}>Back to home</button>
  {:else}
    <h1>Your VEINES result</h1>
    <p class="muted">
      Completed {new Date(latest.calculatedAt).toLocaleDateString()}.
      Higher = better.
    </p>

    <div class="scores">
      <div class="score-card">
        <span class="label">Quality of life (T-score)</span>
        <span class="value">{latest.qolTscore}</span>
        <span class="delta">{formatDelta(qolDelta)}</span>
      </div>
      <div class="score-card">
        <span class="label">Symptoms (T-score)</span>
        <span class="value">{latest.symTscore}</span>
        <span class="delta">{formatDelta(symDelta)}</span>
      </div>
    </div>

    <p class="share">
      Share this with your provider — they understand what these numbers mean for your care.
    </p>

    <div class="actions">
      <button class="primary" onclick={onhome}>Back to home</button>
    </div>

    {#if scores.length > 1}
      <details>
        <summary>Score history ({scores.length} results)</summary>
        <ul>
          {#each scores.slice().reverse() as s (s.id)}
            <li>
              {new Date(s.calculatedAt).toLocaleDateString()} —
              QOL {s.qolTscore}, Symptom {s.symTscore}
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
