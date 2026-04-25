import {
  ITEM_DEFINITIONS,
  NORMATIVE_CONSTANTS,
  QOL_ITEM_COUNT,
  SYM_ITEM_COUNT,
  SCORING_THRESHOLD,
} from './constants';
import type {
  Answers,
  ItemDefinition,
  ItemId,
  ScoringResult,
  Subscale,
} from './types';

const NORMATIVE_BY_ID = new Map(
  NORMATIVE_CONSTANTS.map((n) => [n.itemId, n])
);

function itemsForSubscale(subscale: 'qol' | 'sym'): ItemDefinition[] {
  return ITEM_DEFINITIONS.filter(
    (item) =>
      item.subscale === subscale || item.subscale === 'both'
  );
}

function applyReverseScoring(
  rawValue: number,
  range: readonly [number, number]
): number {
  const [min, max] = range;
  return max + min - rawValue;
}

function zScoreForItem(
  item: ItemDefinition,
  rawValue: number
): number {
  const norm = NORMATIVE_BY_ID.get(item.id);
  if (!norm) {
    throw new Error(`Missing normative constants for item ${item.id}`);
  }
  const value = item.reverseScored
    ? applyReverseScoring(rawValue, item.scaleRange)
    : rawValue;
  return (value - norm.mean) / norm.sd;
}

function meanZScore(
  items: ItemDefinition[],
  answers: Answers
): { mean: number; itemsScored: number; missing: ItemId[] } {
  const zScores: number[] = [];
  const missing: ItemId[] = [];

  for (const item of items) {
    const raw = answers.get(item.id);
    if (raw === undefined) {
      missing.push(item.id);
      continue;
    }
    zScores.push(zScoreForItem(item, raw));
  }

  if (zScores.length === 0) {
    return { mean: 0, itemsScored: 0, missing };
  }

  const sum = zScores.reduce((acc, z) => acc + z, 0);
  return {
    mean: sum / zScores.length,
    itemsScored: zScores.length,
    missing,
  };
}

function tScore(meanZ: number): number {
  return Math.round((meanZ * 10 + 50) * 10) / 10;
}

function isComplete(itemsScored: number, total: number): boolean {
  return itemsScored / total >= SCORING_THRESHOLD;
}

export function score(answers: Answers): ScoringResult {
  const qolItems = itemsForSubscale('qol');
  const symItems = itemsForSubscale('sym');

  const qol = meanZScore(qolItems, answers);
  const sym = meanZScore(symItems, answers);

  const qolComplete = isComplete(qol.itemsScored, QOL_ITEM_COUNT);
  const symComplete = isComplete(sym.itemsScored, SYM_ITEM_COUNT);

  if (!qolComplete || !symComplete) {
    const missing = Array.from(new Set([...qol.missing, ...sym.missing]));
    return {
      status: 'incomplete',
      missing,
      threshold: SCORING_THRESHOLD,
    };
  }

  return {
    status: 'ok',
    qolTscore: tScore(qol.mean),
    symTscore: tScore(sym.mean),
    itemsScored: qol.itemsScored + sym.itemsScored,
  };
}

export function allItemIds(): ItemId[] {
  return ITEM_DEFINITIONS.map((i) => i.id);
}

export function itemDefinition(id: ItemId): ItemDefinition | undefined {
  return ITEM_DEFINITIONS.find((i) => i.id === id);
}

export function subscaleFor(id: ItemId): Subscale | undefined {
  return itemDefinition(id)?.subscale;
}
