import { describe, expect, it } from 'vitest';
import {
  DEFAULT_COHORT_SETTINGS,
  cohortCsv,
  generateCohort,
  protocolBrief,
  summarizeCohort,
} from './cohort';

describe('cohort studio', () => {
  it('generates deterministic fake patients', () => {
    const a = generateCohort(DEFAULT_COHORT_SETTINGS);
    const b = generateCohort(DEFAULT_COHORT_SETTINGS);
    expect(a).toEqual(b);
    expect(a).toHaveLength(DEFAULT_COHORT_SETTINGS.size);
    expect(a[0].id).toBe('fake-001');
  });

  it('summarizes follow-up completion and score deltas', () => {
    const summary = summarizeCohort(generateCohort(DEFAULT_COHORT_SETTINGS));
    expect(summary).toHaveLength(5);
    expect(summary[0].completionRate).toBe(100);
    expect(summary[4].completionRate).toBeGreaterThan(40);
    expect(summary[4].qolDelta).toBeGreaterThan(5);
  });

  it('exports fake cohort CSV', () => {
    const cohort = generateCohort({ ...DEFAULT_COHORT_SETTINGS, size: 8 });
    const csv = cohortCsv(cohort);
    expect(csv).toContain('patient_id,window,completed,qol_tscore,sym_tscore');
    expect(csv).toContain('fake-001,baseline,true');
  });

  it('builds a protocol brief with a synthetic-data caveat', () => {
    const summary = summarizeCohort(generateCohort(DEFAULT_COHORT_SETTINGS));
    const brief = protocolBrief(DEFAULT_COHORT_SETTINGS, summary);
    expect(brief).toContain('VQOL fake cohort protocol brief');
    expect(brief).toContain('not clinical evidence');
  });
});
