<script lang="ts">
  import { onMount } from 'svelte';
  import { getActiveDraft, latestScore } from '../lib/storage/db';
  import type { SessionRecord, ScoreRecord } from '../lib/storage/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onstart: () => void;
    onview: () => void;
    ondemo: () => void;
    onlab: () => void;
  }

  let { t, onstart, onview, ondemo, onlab }: Props = $props();

  let draft = $state<SessionRecord | undefined>(undefined);
  let prior = $state<ScoreRecord | undefined>(undefined);
  let loading = $state(true);

  onMount(async () => {
    [draft, prior] = await Promise.all([getActiveDraft(), latestScore()]);
    loading = false;
  });

  function fmtDate(ts: number): string {
    return new Date(ts).toLocaleDateString();
  }
</script>

<section>
  <h1>{t('home.title')}</h1>
  <p>{t('home.intro')}</p>

  {#if loading}
    <p class="muted">{t('home.loading')}</p>
  {:else}
    {#if draft}
      <div class="card">
        <h2>{t('home.resume.title')}</h2>
        <p class="muted">{t('home.resume.body', { date: fmtDate(draft.startedAt) })}</p>
        <div class="actions">
          <button class="primary" onclick={onstart}>{t('home.resume.cta')}</button>
          <button onclick={onstart}>{t('home.resume.alt')}</button>
        </div>
      </div>
    {:else}
      <div class="card">
        <h2>{t('home.start.title')}</h2>
        <p class="muted">{t('home.start.body')}</p>
        <div class="actions">
          <button class="primary" onclick={onstart}>{t('home.start.cta')}</button>
        </div>
      </div>
    {/if}

    {#if prior}
      <div class="card">
        <h2>{t('home.prior.title')}</h2>
        <p class="muted">
          {t('home.prior.body', {
            date: fmtDate(prior.calculatedAt),
            qol: prior.qolTscore,
            sym: prior.symTscore,
          })}
        </p>
        <div class="actions">
          <button onclick={onview}>{t('home.prior.cta')}</button>
        </div>
      </div>
    {/if}

    <div class="card">
      <h2>{t('home.tools.title')}</h2>
      <p class="muted">{t('home.tools.body')}</p>
      <div class="actions">
        <button onclick={ondemo}>{t('home.tools.demo')}</button>
        <button onclick={onlab}>{t('home.tools.lab')}</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .card {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    margin: 1.25rem 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  @media (min-width: 480px) {
    .actions {
      flex-direction: row;
    }
  }
</style>
