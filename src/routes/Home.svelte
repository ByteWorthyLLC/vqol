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
    onstudio: () => void;
    onlaunch: () => void;
  }

  let { t, onstart, onview, ondemo, onlab, onstudio, onlaunch }: Props = $props();

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

<section class="hero">
  <span class="eyebrow">{t('home.eyebrow')}</span>
  <h1>{t('home.title')}</h1>
  <p class="lede">{t('home.intro')}</p>

  <div class="trust" aria-label={t('home.trust.label')}>
    <span class="pill">
      <span class="dot" aria-hidden="true"></span>
      {t('home.trust.local')}
    </span>
    <span class="pill">
      <span class="dot" aria-hidden="true"></span>
      {t('home.trust.notelemetry')}
    </span>
    <span class="pill">
      <span class="dot" aria-hidden="true"></span>
      {t('home.trust.opensource')}
    </span>
  </div>
</section>

{#if loading}
  <p class="muted">{t('home.loading')}</p>
{:else}
  {#if draft}
    <article class="card primary-card" aria-labelledby="resume-title">
      <header class="card-header">
        <h2 id="resume-title">{t('home.resume.title')}</h2>
      </header>
      <p>{t('home.resume.body', { date: fmtDate(draft.startedAt) })}</p>
      <div class="actions">
        <button class="primary" onclick={onstart}>{t('home.resume.cta')}</button>
        <button onclick={onstart}>{t('home.resume.alt')}</button>
      </div>
    </article>
  {:else}
    <article class="card primary-card" aria-labelledby="start-title">
      <header class="card-header">
        <h2 id="start-title">{t('home.start.title')}</h2>
      </header>
      <p>{t('home.start.body')}</p>
      <div class="actions">
        <button class="primary" onclick={onstart}>{t('home.start.cta')}</button>
        <button onclick={ondemo}>{t('home.tools.demo')}</button>
      </div>
    </article>
  {/if}

  {#if prior}
    <article class="card" aria-labelledby="prior-title">
      <header class="card-header">
        <h2 id="prior-title">{t('home.prior.title')}</h2>
      </header>
      <p>
        {t('home.prior.body', {
          date: fmtDate(prior.calculatedAt),
          qol: prior.qolTscore,
          sym: prior.symTscore,
        })}
      </p>
      <div class="actions">
        <button onclick={onview}>{t('home.prior.cta')}</button>
      </div>
    </article>
  {/if}
{/if}

<section class="how-it-works" aria-labelledby="how-title">
  <h2 id="how-title">{t('home.how.title')}</h2>
  <ol class="steps">
    <li>
      <span class="step-num" aria-hidden="true">1</span>
      <div>
        <h3>{t('home.how.step1.title')}</h3>
        <p class="muted">{t('home.how.step1.body')}</p>
      </div>
    </li>
    <li>
      <span class="step-num" aria-hidden="true">2</span>
      <div>
        <h3>{t('home.how.step2.title')}</h3>
        <p class="muted">{t('home.how.step2.body')}</p>
      </div>
    </li>
    <li>
      <span class="step-num" aria-hidden="true">3</span>
      <div>
        <h3>{t('home.how.step3.title')}</h3>
        <p class="muted">{t('home.how.step3.body')}</p>
      </div>
    </li>
  </ol>
</section>

<section class="tools-section" aria-labelledby="tools-title">
  <header class="section-header">
    <h2 id="tools-title">{t('home.tools.title')}</h2>
    <p class="muted">{t('home.tools.body')}</p>
  </header>
  <div class="tools-grid">
    <button class="tool-card" onclick={onstudio} type="button">
      <span class="tool-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
      </span>
      <span class="tool-text">
        <span class="tool-title">{t('home.tools.studio')}</span>
        <span class="tool-sub">{t('home.tools.studio.sub')}</span>
      </span>
    </button>
    <button class="tool-card" onclick={onlaunch} type="button">
      <span class="tool-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19l4-1 8-8a2.83 2.83 0 0 0-4-4l-8 8-1 4z"/><path d="M14 6l4 4"/></svg>
      </span>
      <span class="tool-text">
        <span class="tool-title">{t('home.tools.launch')}</span>
        <span class="tool-sub">{t('home.tools.launch.sub')}</span>
      </span>
    </button>
    <button class="tool-card" onclick={ondemo} type="button">
      <span class="tool-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-7"/></svg>
      </span>
      <span class="tool-text">
        <span class="tool-title">{t('home.tools.demo')}</span>
        <span class="tool-sub">{t('home.tools.demo.sub')}</span>
      </span>
    </button>
    <button class="tool-card" onclick={onlab} type="button">
      <span class="tool-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6"/><path d="M10 3v6l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 18l-5-9V3"/></svg>
      </span>
      <span class="tool-text">
        <span class="tool-title">{t('home.tools.lab')}</span>
        <span class="tool-sub">{t('home.tools.lab.sub')}</span>
      </span>
    </button>
  </div>
</section>

<style>
  .hero {
    padding: var(--space-2) 0 var(--space-6);
  }
  .hero h1 {
    margin: 0 0 var(--space-3);
  }
  .hero .lede {
    margin: 0 0 var(--space-5);
  }
  .trust {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.35rem 0.7rem;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--fg);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    letter-spacing: 0.01em;
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--action);
  }

  .card {
    margin: var(--space-5) 0;
  }
  .primary-card {
    background: linear-gradient(180deg, var(--surface-elevated), var(--accent-soft));
    border-color: color-mix(in oklab, var(--accent) 30%, var(--border));
  }
  .card-header {
    margin-bottom: var(--space-2);
  }
  .card h2 {
    margin: 0;
  }
  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }
  @media (min-width: 480px) {
    .actions {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  .how-it-works {
    margin: var(--space-10) 0 var(--space-8);
  }
  .steps {
    list-style: none;
    margin: var(--space-4) 0 0;
    padding: 0;
    display: grid;
    gap: var(--space-3);
  }
  .steps li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: var(--space-4);
  }
  .steps h3 {
    margin: 0 0 var(--space-1);
    font-size: var(--text-base);
  }
  .steps p {
    margin: 0;
  }
  .step-num {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-soft);
    color: var(--accent);
    font-weight: var(--weight-bold);
    font-size: var(--text-sm);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .tools-section {
    margin: var(--space-8) 0 var(--space-6);
  }
  .section-header {
    margin-bottom: var(--space-4);
  }
  .section-header h2 {
    margin: 0 0 var(--space-2);
  }
  .section-header .muted {
    margin: 0;
  }
  .tools-grid {
    display: grid;
    gap: var(--space-3);
    grid-template-columns: 1fr;
  }
  @media (min-width: 540px) {
    .tools-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .tool-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    text-align: left;
    background: var(--surface-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    min-height: auto;
    font-weight: var(--weight-regular);
  }
  .tool-card:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
  }
  .tool-icon {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-md);
    background: var(--accent-soft);
    color: var(--accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .tool-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .tool-title {
    font-weight: var(--weight-semibold);
    color: var(--fg-strong);
  }
  .tool-sub {
    color: var(--muted);
    font-size: var(--text-sm);
    font-weight: var(--weight-regular);
  }
</style>
