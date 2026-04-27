<script lang="ts">
  import {
    DEFAULT_COHORT_SETTINGS,
    cohortCsv,
    generateCohort,
    protocolBrief,
    summarizeCohort,
  } from '../lib/studio/cohort';
  import { downloadTextFile } from '../lib/download/text';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    onback: () => void;
    onforge: () => void;
  }

  let { t, onback, onforge }: Props = $props();

  let seed = $state(DEFAULT_COHORT_SETTINGS.seed);
  let size = $state(DEFAULT_COHORT_SETTINGS.size);
  let completionRate = $state(DEFAULT_COHORT_SETTINGS.completionRate);
  let treatmentLift = $state(DEFAULT_COHORT_SETTINGS.treatmentLift);
  let volatility = $state(DEFAULT_COHORT_SETTINGS.volatility);

  const settings = $derived({
    ...DEFAULT_COHORT_SETTINGS,
    seed,
    size,
    completionRate,
    treatmentLift,
    volatility,
  });
  const cohort = $derived(generateCohort(settings));
  const summary = $derived(summarizeCohort(cohort));
  const strongerSettings = $derived({
    ...settings,
    seed: `${settings.seed}-stronger`,
    completionRate: 1,
    treatmentLift: settings.treatmentLift + 3,
  });
  const strongerSummary = $derived(summarizeCohort(generateCohort(strongerSettings)));
  const finalRow = $derived(summary[summary.length - 1]);
  const strongerFinalRow = $derived(strongerSummary[strongerSummary.length - 1]);

  function fmt(value: number | null): string {
    return value === null ? 'n/a' : String(value);
  }

  function percent(value: number): string {
    return `${Math.round(value * 100)}%`;
  }

  function downloadCsv(): void {
    downloadTextFile('vqol-fake-cohort.csv', cohortCsv(cohort), 'text/csv;charset=utf-8');
  }

  function downloadBrief(): void {
    downloadTextFile(
      'vqol-protocol-brief.txt',
      protocolBrief(settings, summary),
      'text/plain;charset=utf-8'
    );
  }
</script>

<section>
  <h1>{t('studio.title')}</h1>
  <p>{t('studio.body')}</p>

  <div class="controls" aria-label={t('studio.controls')}>
    <label>
      <span>{t('studio.seed')}</span>
      <input bind:value={seed} />
    </label>
    <label>
      <span>{t('studio.size')}</span>
      <input type="number" min="8" max="240" bind:value={size} />
    </label>
    <label>
      <span>{t('studio.completion')}</span>
      <input type="range" min="0.25" max="1" step="0.01" bind:value={completionRate} />
      <strong>{percent(completionRate)}</strong>
    </label>
    <label>
      <span>{t('studio.lift')}</span>
      <input type="range" min="-10" max="30" step="1" bind:value={treatmentLift} />
      <strong>{treatmentLift}</strong>
    </label>
    <label>
      <span>{t('studio.volatility')}</span>
      <input type="range" min="0" max="18" step="1" bind:value={volatility} />
      <strong>{volatility}</strong>
    </label>
  </div>

  <div class="comparison">
    <article>
      <span class="label">{t('studio.current')}</span>
      <strong>{fmt(finalRow?.qolDelta ?? null)}</strong>
      <p class="muted">{t('studio.card.qol', { completion: finalRow?.completionRate ?? 0 })}</p>
    </article>
    <article>
      <span class="label">{t('studio.stronger')}</span>
      <strong>{fmt(strongerFinalRow?.qolDelta ?? null)}</strong>
      <p class="muted">{t('studio.card.qol', { completion: strongerFinalRow?.completionRate ?? 0 })}</p>
    </article>
  </div>

  <div class="table-wrap">
    <table>
      <caption>{t('studio.table.caption')}</caption>
      <thead>
        <tr>
          <th>{t('studio.table.window')}</th>
          <th>{t('studio.table.completed')}</th>
          <th>{t('studio.table.qol')}</th>
          <th>{t('studio.table.sym')}</th>
          <th>{t('studio.table.delta')}</th>
        </tr>
      </thead>
      <tbody>
        {#each summary as row}
          <tr>
            <td>{row.label}</td>
            <td>{row.completed} / {size} ({row.completionRate}%)</td>
            <td>{fmt(row.meanQol)}</td>
            <td>{fmt(row.meanSym)}</td>
            <td>{fmt(row.qolDelta)} / {fmt(row.symDelta)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="actions">
    <button class="primary" onclick={downloadCsv}>{t('studio.export.csv')}</button>
    <button onclick={downloadBrief}>{t('studio.export.brief')}</button>
    <button onclick={onforge}>{t('studio.open.forge')}</button>
    <button onclick={onback}>{t('lab.back')}</button>
  </div>
</section>

<style>
  .controls {
    display: grid;
    gap: 0.75rem;
    margin: 1.25rem 0;
  }
  label {
    display: grid;
    gap: 0.35rem;
  }
  label span,
  .label {
    color: var(--muted);
    font-size: 0.85rem;
  }
  input {
    width: 100%;
    min-height: 44px;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.55rem 0.7rem;
    font: inherit;
    color: var(--fg);
    background: var(--bg);
  }
  input[type='range'] {
    padding: 0;
  }
  .comparison {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin: 1.5rem 0;
  }
  @media (min-width: 560px) {
    .comparison {
      grid-template-columns: 1fr 1fr;
    }
  }
  .comparison article {
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }
  .comparison strong {
    display: block;
    margin: 0.2rem 0;
    font-size: 2rem;
    line-height: 1;
  }
  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: 8px;
    margin: 1.25rem 0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 560px;
  }
  caption {
    text-align: left;
    padding: 0.75rem;
    font-weight: 700;
  }
  th,
  td {
    padding: 0.65rem 0.75rem;
    border-top: 1px solid var(--border);
    text-align: left;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>
