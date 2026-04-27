<script lang="ts">
  import { onMount } from 'svelte';
  import { listScores } from '../lib/storage/db';
  import { buildDemoScores, demoSummary } from '../lib/demo/scores';
  import { buildFollowUpIcs, calendarFilename, downloadTextFile } from '../lib/calendar/ics';
  import type { ScoreRecord } from '../lib/storage/types';
  import type { PracticeConfig } from '../lib/practice-config/types';
  import TrendChart from '../lib/chart/TrendChart.svelte';
  import InstallPrompt from './InstallPrompt.svelte';
  import { printScoreReport } from '../lib/pdf/print';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    config: PracticeConfig;
    demo?: boolean;
    onhome: () => void;
    onlab: () => void;
  }

  let { t, config, demo = false, onhome, onlab }: Props = $props();

  let scores = $state<ScoreRecord[]>([]);
  let loading = $state(true);
  let chartCanvas = $state<HTMLCanvasElement | undefined>(undefined);
  let printContainer = $state<HTMLElement | undefined>(undefined);

  onMount(async () => {
    scores = demo ? buildDemoScores() : await listScores();
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
  const demoStats = $derived(demo ? demoSummary(scores) : undefined);

  function deltaTone(d: number | undefined): 'up' | 'down' | 'flat' {
    if (d === undefined || d === 0) return 'flat';
    return d > 0 ? 'up' : 'down';
  }

  function formatDelta(d: number | undefined): string {
    if (d === undefined) return '';
    const sign = d > 0 ? '+' : '';
    return t('results.delta', { sign, value: d });
  }

  function fmtDate(ts: number): string {
    return new Date(ts).toLocaleDateString();
  }

  function exportPdf(): void {
    const dataUrl = chartCanvas ? chartCanvas.toDataURL('image/png') : null;
    printScoreReport({
      chartDataUrl: dataUrl,
      injectionTarget: printContainer ?? null,
    });
  }

  function exportCalendar(): void {
    if (!latest) return;
    downloadTextFile(
      calendarFilename(latest),
      buildFollowUpIcs(latest, config),
      'text/calendar;charset=utf-8'
    );
  }
</script>

<section>
  {#if loading}
    <p class="muted" aria-busy="true">{t('home.loading')}</p>
  {:else if !latest}
    <div class="empty-state">
      <h1>{t('results.empty.title')}</h1>
      <p class="lede">{t('results.empty.body')}</p>
      <button class="primary" onclick={onhome}>{t('results.back')}</button>
    </div>
  {:else}
    <div class="screen-only">
      <header class="page-header">
        <span class="eyebrow">{t('results.eyebrow')}</span>
        <h1>{t('results.title')}</h1>
        <p class="muted">{t('results.subtitle', { date: fmtDate(latest.calculatedAt) })}</p>
      </header>

      {#if demo && demoStats}
        <aside class="demo-banner" role="note">
          <div class="demo-banner-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><circle cx="12" cy="16" r="0.8" fill="currentColor"/></svg>
          </div>
          <div>
            <strong>{t('results.demo.title')}</strong>
            <p>
              {t('results.demo.body', {
                months: demoStats.months,
                qol: demoStats.qolChange,
                sym: demoStats.symChange,
              })}
            </p>
          </div>
        </aside>
      {/if}

      <div class="scores">
        <article class="score-card">
          <span class="label">{t('results.qol.label')}</span>
          <span class="value">{latest.qolTscore}</span>
          <span class="delta" data-tone={deltaTone(qolDelta)}>
            {formatDelta(qolDelta)}
          </span>
        </article>
        <article class="score-card">
          <span class="label">{t('results.sym.label')}</span>
          <span class="value">{latest.symTscore}</span>
          <span class="delta" data-tone={deltaTone(symDelta)}>
            {formatDelta(symDelta)}
          </span>
        </article>
      </div>

      {#if scores.length >= 1}
        <TrendChart
          {t}
          {scores}
          onCanvasReady={(c) => { chartCanvas = c; }}
        />
      {/if}

      <div class="share-card">
        <span class="share-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12c0 5-4 9-9 9-1.6 0-3.1-.4-4.4-1.1L3 21l1.1-4.6A9 9 0 1 1 21 12z"/></svg>
        </span>
        <p class="share">{t('results.share')}</p>
      </div>

      <div class="actions">
        <button class="action" onclick={exportPdf}>{t('results.export.cta')}</button>
        <button onclick={exportCalendar}>{t('results.calendar.cta')}</button>
        <button class="ghost" onclick={onlab}>{t('results.lab.cta')}</button>
        <button class="ghost" onclick={onhome}>{t('results.back')}</button>
      </div>
      <p class="muted hint">{t('results.export.hint')}</p>
      <p class="muted hint">{t('results.calendar.hint')}</p>

      <InstallPrompt {t} />

      {#if scores.length > 1}
        <details class="history">
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
    </div>

    <article bind:this={printContainer} class="print-only print-report">
      <header>
        <h1>{config.practiceName}</h1>
        <p class="subtitle">{t('print.report.title')}</p>
        <p class="subtitle muted">{t('print.report.subtitle')}</p>
      </header>

      <section class="print-scores">
        <h2>{t('print.report.scoreLabel', { date: fmtDate(latest.calculatedAt) })}</h2>
        <table class="print-score-table">
          <tbody>
            <tr>
              <th>{t('print.report.qol')}</th>
              <td><strong>{latest.qolTscore}</strong> {formatDelta(qolDelta)}</td>
            </tr>
            <tr>
              <th>{t('print.report.sym')}</th>
              <td><strong>{latest.symTscore}</strong> {formatDelta(symDelta)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {#if scores.length > 1}
        <section>
          <h2>{t('print.report.history')}</h2>
          <table class="print-history-table">
            <thead>
              <tr>
                <th>{t('chart.dateLabel')}</th>
                <th>{t('chart.qolSeries')}</th>
                <th>{t('chart.symSeries')}</th>
              </tr>
            </thead>
            <tbody>
              {#each scores as s (s.id)}
                <tr>
                  <td>{fmtDate(s.calculatedAt)}</td>
                  <td>{s.qolTscore}</td>
                  <td>{s.symTscore}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </section>
      {/if}

      <footer class="print-footer">
        <p class="citation">{t('print.report.citation')}</p>
        <p class="ownership">{t('print.report.dataownership')}</p>
        {#if config.primaryContact.phone || config.primaryContact.email || config.primaryContact.websiteUrl}
          <p class="contact">
            {#if config.primaryContact.phone}{config.primaryContact.phone}{/if}
            {#if config.primaryContact.phone && (config.primaryContact.email || config.primaryContact.websiteUrl)} · {/if}
            {#if config.primaryContact.email}{config.primaryContact.email}{/if}
            {#if config.primaryContact.email && config.primaryContact.websiteUrl} · {/if}
            {#if config.primaryContact.websiteUrl}{config.primaryContact.websiteUrl}{/if}
          </p>
        {/if}
      </footer>
    </article>
  {/if}
</section>

<style>
  .empty-state {
    text-align: center;
    padding: var(--space-10) var(--space-2) var(--space-8);
  }
  .page-header {
    margin-bottom: var(--space-6);
  }
  .page-header h1 {
    margin-bottom: var(--space-2);
  }
  .page-header .muted {
    margin: 0;
  }

  .scores {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-3);
    margin: var(--space-5) 0;
  }
  @media (min-width: 480px) {
    .scores {
      grid-template-columns: 1fr 1fr;
    }
  }
  .score-card {
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-5);
    background: var(--surface-elevated);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    position: relative;
    overflow: hidden;
  }
  .score-card::before {
    content: '';
    position: absolute;
    inset: 0 0 auto 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), var(--action));
    opacity: 0.85;
  }
  .label {
    font-size: var(--text-xs);
    font-weight: var(--weight-semibold);
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .value {
    font-size: 3rem;
    font-weight: var(--weight-bold);
    line-height: 1;
    color: var(--fg-strong);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .delta {
    font-size: var(--text-sm);
    color: var(--muted);
    font-variant-numeric: tabular-nums;
  }
  .delta[data-tone='up'] {
    color: var(--success);
  }
  .delta[data-tone='down'] {
    color: var(--danger);
  }

  .demo-banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    border: 1px solid color-mix(in oklab, var(--accent) 35%, var(--border));
    border-radius: var(--radius-md);
    padding: var(--space-4);
    margin: var(--space-4) 0;
    background: var(--accent-soft);
  }
  .demo-banner-mark {
    flex: 0 0 auto;
    color: var(--accent);
    margin-top: 2px;
  }
  .demo-banner p {
    margin: var(--space-1) 0 0;
  }

  .share-card {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    margin: var(--space-5) 0;
    padding: var(--space-4);
    background: var(--success-soft);
    border-radius: var(--radius-md);
    border: 1px solid color-mix(in oklab, var(--success) 25%, var(--border));
  }
  .share-mark {
    flex: 0 0 auto;
    color: var(--success);
    margin-top: 2px;
  }
  .share {
    margin: 0;
    color: var(--fg);
    font-size: var(--text-sm);
  }

  .actions {
    margin: var(--space-5) 0 var(--space-2);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .hint {
    margin: 0 0 var(--space-3);
    font-size: var(--text-xs);
  }
  details.history {
    margin-top: var(--space-8);
    border-top: 1px solid var(--border);
    padding-top: var(--space-4);
  }
  details.history summary {
    cursor: pointer;
    font-weight: var(--weight-semibold);
    padding: var(--space-2) 0;
    color: var(--fg-strong);
  }
  details.history ul {
    list-style: none;
    padding: 0;
    margin: var(--space-2) 0 0;
  }
  details.history li {
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border);
    color: var(--muted);
    font-size: var(--text-sm);
    font-variant-numeric: tabular-nums;
  }
  details.history li:last-child {
    border-bottom: 0;
  }

  .print-only {
    display: none;
  }
  .print-report header h1 {
    margin: 0;
    font-size: 1.5rem;
  }
  .print-report .subtitle {
    margin: 0.15rem 0;
    font-size: 1rem;
  }
  .print-score-table,
  .print-history-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0.75rem 0;
  }
  .print-score-table th,
  .print-history-table th,
  .print-history-table td,
  .print-score-table td {
    padding: 0.4rem 0.5rem;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }
  .print-footer {
    margin-top: 1.5rem;
    border-top: 1px solid #ccc;
    padding-top: 0.75rem;
  }
  .print-footer .citation,
  .print-footer .ownership,
  .print-footer .contact {
    margin: 0.25rem 0;
    font-size: 0.85rem;
  }

  :global(body.is-printing .screen-only) {
    display: none;
  }
  :global(body.is-printing .print-only) {
    display: block;
  }
  :global(.print-chart-img) {
    display: block;
    width: 100%;
    max-width: 100%;
    margin: 0.5rem 0;
  }
</style>
