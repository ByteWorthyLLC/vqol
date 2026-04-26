import { describe, expect, it } from 'vitest';
import { buildDemoScores, demoSummary } from './scores';

describe('demo scores', () => {
  it('builds deterministic ascending fake scores', () => {
    const scores = buildDemoScores(Date.UTC(2026, 3, 26));
    expect(scores).toHaveLength(5);
    expect(scores.map((s) => s.id)).toEqual([
      'demo-baseline',
      'demo-1-month',
      'demo-3-month',
      'demo-6-month',
      'demo-12-month',
    ]);
    expect(scores[0].calculatedAt).toBeLessThan(scores[4].calculatedAt);
  });

  it('summarizes the fake trajectory', () => {
    const summary = demoSummary(buildDemoScores(Date.UTC(2026, 3, 26)));
    expect(summary.qolChange).toBeCloseTo(17.3);
    expect(summary.symChange).toBeCloseTo(17.4);
    expect(summary.months).toBe(12);
  });
});
