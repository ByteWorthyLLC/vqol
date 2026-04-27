export interface CohortSettings {
  seed: string;
  size: number;
  completionRate: number;
  treatmentLift: number;
  volatility: number;
  baselineQol: number;
  baselineSym: number;
}

export interface CohortWindow {
  key: string;
  label: string;
  month: number;
  responseCurve: number;
}

export interface CohortScore {
  windowKey: string;
  completed: boolean;
  qolTscore: number | null;
  symTscore: number | null;
}

export interface CohortPatient {
  id: string;
  responderBias: number;
  scores: CohortScore[];
}

export interface CohortSummaryRow {
  key: string;
  label: string;
  month: number;
  completed: number;
  completionRate: number;
  meanQol: number | null;
  meanSym: number | null;
  qolDelta: number | null;
  symDelta: number | null;
}

export const COHORT_WINDOWS: readonly CohortWindow[] = [
  { key: 'baseline', label: 'Baseline', month: 0, responseCurve: 0 },
  { key: '1mo', label: '1 month', month: 1, responseCurve: 0.34 },
  { key: '3mo', label: '3 months', month: 3, responseCurve: 0.72 },
  { key: '6mo', label: '6 months', month: 6, responseCurve: 0.9 },
  { key: '12mo', label: '12 months', month: 12, responseCurve: 1 },
];

export const DEFAULT_COHORT_SETTINGS: CohortSettings = {
  seed: 'vqol-public-demo',
  size: 48,
  completionRate: 0.78,
  treatmentLift: 15,
  volatility: 5,
  baselineQol: 39,
  baselineSym: 37,
};

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), t | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function normal(rand: () => number): number {
  const u = Math.max(rand(), Number.EPSILON);
  const v = Math.max(rand(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Number(score.toFixed(1))));
}

function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return Number((values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1));
}

export function normalizeCohortSettings(settings: CohortSettings): CohortSettings {
  return {
    seed: settings.seed.trim() || DEFAULT_COHORT_SETTINGS.seed,
    size: Math.max(8, Math.min(240, Math.round(settings.size))),
    completionRate: Math.max(0.25, Math.min(1, settings.completionRate)),
    treatmentLift: Math.max(-10, Math.min(30, settings.treatmentLift)),
    volatility: Math.max(0, Math.min(18, settings.volatility)),
    baselineQol: Math.max(15, Math.min(70, settings.baselineQol)),
    baselineSym: Math.max(15, Math.min(70, settings.baselineSym)),
  };
}

export function generateCohort(input: CohortSettings): CohortPatient[] {
  const settings = normalizeCohortSettings(input);
  const rand = mulberry32(hashSeed(JSON.stringify(settings)));
  const patients: CohortPatient[] = [];

  for (let i = 0; i < settings.size; i += 1) {
    const responderBias = normal(rand) * 2.4;
    const baseQol = clampScore(settings.baselineQol + normal(rand) * settings.volatility);
    const baseSym = clampScore(settings.baselineSym + normal(rand) * settings.volatility);

    patients.push({
      id: `fake-${String(i + 1).padStart(3, '0')}`,
      responderBias: Number(responderBias.toFixed(2)),
      scores: COHORT_WINDOWS.map((window, windowIndex) => {
        const retentionDecay = windowIndex * 0.045;
        const completed =
          window.key === 'baseline' ||
          rand() < Math.max(0.1, settings.completionRate - retentionDecay);

        if (!completed) {
          return {
            windowKey: window.key,
            completed: false,
            qolTscore: null,
            symTscore: null,
          };
        }

        const response =
          settings.treatmentLift * window.responseCurve +
          responderBias * window.responseCurve +
          normal(rand) * settings.volatility * 0.35;

        return {
          windowKey: window.key,
          completed: true,
          qolTscore: clampScore(baseQol + response),
          symTscore: clampScore(baseSym + response * 0.96 + normal(rand) * 0.8),
        };
      }),
    });
  }

  return patients;
}

export function summarizeCohort(cohort: readonly CohortPatient[]): CohortSummaryRow[] {
  const baselineScores = cohort
    .map((patient) => patient.scores.find((score) => score.windowKey === 'baseline'))
    .filter((score): score is CohortScore => Boolean(score?.completed));
  const baselineQol = mean(baselineScores.map((score) => score.qolTscore ?? 0));
  const baselineSym = mean(baselineScores.map((score) => score.symTscore ?? 0));

  return COHORT_WINDOWS.map((window) => {
    const scores = cohort
      .map((patient) => patient.scores.find((score) => score.windowKey === window.key))
      .filter((score): score is CohortScore => Boolean(score?.completed));
    const meanQol = mean(scores.map((score) => score.qolTscore ?? 0));
    const meanSym = mean(scores.map((score) => score.symTscore ?? 0));
    return {
      key: window.key,
      label: window.label,
      month: window.month,
      completed: scores.length,
      completionRate: cohort.length === 0 ? 0 : Math.round((scores.length / cohort.length) * 100),
      meanQol,
      meanSym,
      qolDelta:
        meanQol === null || baselineQol === null
          ? null
          : Number((meanQol - baselineQol).toFixed(1)),
      symDelta:
        meanSym === null || baselineSym === null
          ? null
          : Number((meanSym - baselineSym).toFixed(1)),
    };
  });
}

export function cohortCsv(cohort: readonly CohortPatient[]): string {
  const rows = ['patient_id,window,completed,qol_tscore,sym_tscore'];
  for (const patient of cohort) {
    for (const score of patient.scores) {
      rows.push([
        patient.id,
        score.windowKey,
        score.completed ? 'true' : 'false',
        score.qolTscore ?? '',
        score.symTscore ?? '',
      ].join(','));
    }
  }
  return `${rows.join('\n')}\n`;
}

export function protocolBrief(
  settings: CohortSettings,
  summary: readonly CohortSummaryRow[]
): string {
  const normalized = normalizeCohortSettings(settings);
  const latest = summary[summary.length - 1];
  return [
    'VQOL fake cohort protocol brief',
    '',
    `Seed: ${normalized.seed}`,
    `Cohort size: ${normalized.size}`,
    `Target completion: ${Math.round(normalized.completionRate * 100)}%`,
    `Modeled treatment lift: ${normalized.treatmentLift} T-score points`,
    `Volatility: ${normalized.volatility}`,
    '',
    latest
      ? `12-month fake aggregate: QOL ${latest.meanQol ?? 'n/a'} (${latest.qolDelta ?? 'n/a'}), Symptoms ${latest.meanSym ?? 'n/a'} (${latest.symDelta ?? 'n/a'}), completion ${latest.completionRate}%`
      : 'No summary rows available.',
    '',
    'This is synthetic data for planning, demos, and software testing. It is not clinical evidence.',
  ].join('\n');
}
