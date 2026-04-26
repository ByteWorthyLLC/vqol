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
    <p class="muted">{t('home.loading')}</p>
  {:else if !latest}
    <h1>{t('results.empty.title')}</h1>
    <p>{t('results.empty.body')}</p>
    <button class="primary" onclick={onhome}>{t('results.back')}</button>
  {:else}
    <div class="screen-only">
      <h1>{t('results.title')}</h1>
      <p class="muted">{t('results.subtitle', { date: fmtDate(latest.calculatedAt) })}</p>

      {#if demo && demoStats}
        <div class="demo-banner" role="note">
          <strong>{t('results.demo.title')}</strong>
          <p>
            {t('results.demo.body', {
              months: demoStats.months,
              qol: demoStats.qolChange,
              sym: demoStats.symChange,
            })}
          </p>
        </div>
      {/if}

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

      {#if scores.length >= 1}
        <TrendChart
          {t}
          {scores}
          onCanvasReady={(c) => { chartCanvas = c; }}
        />
      {/if}

      <p class="share">{t('results.share')}</p>

      <div class="actions">
        <button class="primary" onclick={exportPdf}>{t('results.export.cta')}</button>
        <button onclick={exportCalendar}>{t('results.calendar.cta')}</button>
        <button onclick={onlab}>{t('results.lab.cta')}</button>
        <button onclick={onhome}>{t('results.back')}</button>
      </div>
      <p class="muted hint">{t('results.export.hint')}</p>
      <p class="muted hint">{t('results.calendar.hint')}</p>

      <InstallPrompt {t} />

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
    </div>

    <!-- Print-only template — hidden on screen, surfaces in @media print -->
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
  .demo-banner {
    border: 1px solid color-mix(in oklab, var(--accent) 45%, var(--border));
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    background: color-mix(in oklab, var(--accent) 8%, transparent);
  }
  .demo-banner p {
    margin: 0.25rem 0 0;
  }
  .actions {
    margin: 1.5rem 0 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .hint {
    margin: 0 0 1rem;
    font-size: 0.85rem;
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

  /* Print-template structure (visible only via @media print + .is-printing on body) */
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
