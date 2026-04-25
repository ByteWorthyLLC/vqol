<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ScoreRecord } from '../storage/types';

  type T = (k: string, p?: Record<string, string | number>) => string;

  interface Props {
    t: T;
    scores: ScoreRecord[];
    onCanvasReady: (canvas: HTMLCanvasElement) => void;
  }

  let { t, scores, onCanvasReady }: Props = $props();

  let containerEl: HTMLDivElement | undefined;
  let chart: { destroy: () => void } | null = null;

  function buildSeriesData(scores: ScoreRecord[]): {
    xs: number[];
    qol: number[];
    sym: number[];
  } {
    // Sort ascending by date (db.listScores already does, but be defensive)
    const sorted = [...scores].sort((a, b) => a.calculatedAt - b.calculatedAt);
    return {
      xs: sorted.map((s) => Math.floor(s.calculatedAt / 1000)),
      qol: sorted.map((s) => s.qolTscore),
      sym: sorted.map((s) => s.symTscore),
    };
  }

  function getCssVar(name: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    return v || fallback;
  }

  let resizeObserver: ResizeObserver | undefined;

  onMount(() => {
    if (!containerEl) return;

    void (async () => {
      if (!containerEl) return;
      const uPlotMod = await import('uplot');
      await import('uplot/dist/uPlot.min.css');
      const uPlot = uPlotMod.default;

      const { xs, qol, sym } = buildSeriesData(scores);

      const accent = getCssVar('--accent', '#2a5a8a');
      const fg = getCssVar('--fg', '#1a1a1a');

      const opts = {
        title: '',
        width: containerEl.clientWidth,
        height: 280,
        class: 'vqol-trend',
        scales: {
          y: { range: [20, 80] as [number, number] },
        },
        axes: [
          { stroke: fg },
          { stroke: fg, label: t('chart.yAxisLabel') },
        ],
        series: [
          { label: t('chart.dateLabel') },
          {
            label: t('chart.qolSeries'),
            stroke: accent,
            width: 2,
            points: { show: true, size: 6 },
          },
          {
            label: t('chart.symSeries'),
            stroke: fg,
            width: 2,
            dash: [6, 4],
            points: { show: true, size: 6 },
          },
        ],
        hooks: {
          ready: [
            (u: { root: HTMLElement }): void => {
              const canvas = u.root.querySelector('canvas') as HTMLCanvasElement | null;
              if (canvas) onCanvasReady(canvas);
            },
          ],
        },
      };

      chart = new uPlot(opts, [xs, qol, sym], containerEl);

      resizeObserver = new ResizeObserver(() => {
        if (!containerEl || !chart) return;
        const c = chart as unknown as {
          setSize: (s: { width: number; height: number }) => void;
        };
        c.setSize({ width: containerEl.clientWidth, height: 280 });
      });
      resizeObserver.observe(containerEl);
    })();
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
    chart?.destroy();
    chart = null;
  });
</script>

<div
  bind:this={containerEl}
  class="trend-container"
  role="img"
  aria-label={t('chart.aria.summary', {
    count: scores.length,
    qol: scores[scores.length - 1]?.qolTscore ?? 0,
    sym: scores[scores.length - 1]?.symTscore ?? 0,
  })}
></div>

<!-- Visually-hidden table for screen readers + as a fallback when canvas can't print -->
<table class="visually-hidden">
  <caption>{t('chart.tableCaption')}</caption>
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
        <td>{new Date(s.calculatedAt).toLocaleDateString()}</td>
        <td>{s.qolTscore}</td>
        <td>{s.symTscore}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .trend-container {
    width: 100%;
    min-height: 280px;
    margin: 1.5rem 0;
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
