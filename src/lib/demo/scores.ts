import type { ScoreRecord } from '../storage/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface DemoMilestone {
  label: string;
  daysFromBaseline: number;
  qolTscore: number;
  symTscore: number;
}

export const DEMO_MILESTONES: readonly DemoMilestone[] = [
  { label: 'baseline', daysFromBaseline: 0, qolTscore: 38.4, symTscore: 36.9 },
  { label: '1-month', daysFromBaseline: 30, qolTscore: 43.2, symTscore: 42.1 },
  { label: '3-month', daysFromBaseline: 90, qolTscore: 49.8, symTscore: 48.5 },
  { label: '6-month', daysFromBaseline: 180, qolTscore: 52.1, symTscore: 51.4 },
  { label: '12-month', daysFromBaseline: 365, qolTscore: 55.7, symTscore: 54.3 },
];

export function demoBaseline(now = Date.now()): number {
  return now - DEMO_MILESTONES[DEMO_MILESTONES.length - 1].daysFromBaseline * DAY_MS;
}

export function buildDemoScores(now = Date.now()): ScoreRecord[] {
  const baseline = demoBaseline(now);
  return DEMO_MILESTONES.map((point) => ({
    id: `demo-${point.label}`,
    sessionId: `demo-session-${point.label}`,
    qolTscore: point.qolTscore,
    symTscore: point.symTscore,
    calculatedAt: baseline + point.daysFromBaseline * DAY_MS,
  }));
}

export function demoSummary(scores: readonly ScoreRecord[]): {
  qolChange: number;
  symChange: number;
  months: number;
} {
  const first = scores[0];
  const last = scores[scores.length - 1];
  if (!first || !last) {
    return { qolChange: 0, symChange: 0, months: 0 };
  }
  return {
    qolChange: +(last.qolTscore - first.qolTscore).toFixed(1),
    symChange: +(last.symTscore - first.symTscore).toFixed(1),
    months: Math.round((last.calculatedAt - first.calculatedAt) / DAY_MS / 30),
  };
}
