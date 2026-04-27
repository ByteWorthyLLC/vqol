import { describe, it, expect } from 'vitest';
import { score, allItemIds, itemDefinition } from './algorithm';
import {
  ITEM_DEFINITIONS,
  QOL_ITEM_COUNT,
  SYM_ITEM_COUNT,
  SCORING_THRESHOLD,
} from './constants';

function answersAt(value: number): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of ITEM_DEFINITIONS) {
    m.set(item.id, value);
  }
  return m;
}

function answersAtScaleMid(): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of ITEM_DEFINITIONS) {
    const [min, max] = item.scaleRange;
    m.set(item.id, (min + max) / 2);
  }
  return m;
}

function answersAtScaleMax(): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of ITEM_DEFINITIONS) {
    m.set(item.id, item.scaleRange[1]);
  }
  return m;
}

function answersAtScaleMin(): Map<string, number> {
  const m = new Map<string, number>();
  for (const item of ITEM_DEFINITIONS) {
    m.set(item.id, item.scaleRange[0]);
  }
  return m;
}

describe('VEINES-QOL/Sym scoring engine', () => {
  it('exposes 25 QOL items and 10 Sym items per Lamping 2003', () => {
    expect(QOL_ITEM_COUNT).toBe(25);
    expect(SYM_ITEM_COUNT).toBe(10);
  });

  it('returns T-score 50 when all answers equal the placeholder normative mean', () => {
    const result = score(answersAtScaleMid());
    if (result.status !== 'ok') throw new Error('Expected ok');
    expect(result.qolTscore).toBe(50);
    expect(result.symTscore).toBe(50);
  });

  it('produces a higher T-score for max answers than min answers (both subscales)', () => {
    const high = score(answersAtScaleMax());
    const low = score(answersAtScaleMin());
    if (high.status !== 'ok' || low.status !== 'ok') throw new Error('Expected ok');
    expect(high.qolTscore).toBeGreaterThan(low.qolTscore);
    expect(high.symTscore).toBeGreaterThan(low.symTscore);
  });

  it('honors reverse-scoring for Q3, Q6, Q7', () => {
    expect(itemDefinition('Q3')?.reverseScored).toBe(true);
    expect(itemDefinition('Q6')?.reverseScored).toBe(true);
    expect(itemDefinition('Q7')?.reverseScored).toBe(true);
  });

  it('returns "incomplete" when answers are missing below threshold', () => {
    const m = answersAt(3);
    // Drop more than (1 - threshold) of items from QOL items
    const ids = allItemIds();
    const drop = Math.ceil(ids.length * (1 - SCORING_THRESHOLD)) + 2;
    for (let i = 0; i < drop; i += 1) {
      m.delete(ids[i] as string);
    }
    const result = score(m);
    expect(result.status).toBe('incomplete');
    if (result.status !== 'incomplete') return;
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.threshold).toBe(SCORING_THRESHOLD);
  });

  it('scores when exactly at the threshold (≥ 80% items present)', () => {
    const m = answersAtScaleMid();
    // Drop only items unique to QOL (Q4.x. qol-only) so the Sym subscale stays at 100%.
    // QOL has 25 items; 80% threshold means we can drop up to 5 and still score.
    const qolOnly = allItemIds().filter((id) => id.startsWith('Q4.'));
    for (let i = 0; i < 5; i += 1) {
      m.delete(qolOnly[i] as string);
    }
    const result = score(m);
    expect(result.status).toBe('ok');
  });

  it('reverse-scoring inverts the contribution of Q3', () => {
    // Provide max answers to all items
    const allMax = answersAtScaleMax();
    // Then flip Q3 to min. because Q3 is reverse-scored, this should HELP the QOL score
    const allMaxExceptQ3 = new Map(allMax);
    const q3 = itemDefinition('Q3');
    if (!q3) throw new Error('Q3 missing');
    allMaxExceptQ3.set('Q3', q3.scaleRange[0]);

    const a = score(allMax);
    const b = score(allMaxExceptQ3);
    if (a.status !== 'ok' || b.status !== 'ok') throw new Error('Expected ok');
    // Flipping a reverse-scored item from max(=worst-after-reverse) to min(=best-after-reverse)
    // should raise the QOL T-score
    expect(b.qolTscore).toBeGreaterThan(a.qolTscore);
  });

  it('rounds T-scores to 1 decimal place', () => {
    const result = score(answersAtScaleMid());
    if (result.status !== 'ok') throw new Error('Expected ok');
    expect(result.qolTscore).toBe(Math.round(result.qolTscore * 10) / 10);
    expect(result.symTscore).toBe(Math.round(result.symTscore * 10) / 10);
  });
});
