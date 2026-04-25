import { ITEM_DEFINITIONS } from '../scoring/constants';
import type { ItemDefinition, ItemId } from '../scoring/types';

// Item metadata only. Prompt text and answer-scale labels come from messages/{locale}.json
// at runtime (see lib/i18n/loader.ts). See INSTRUMENT-LICENSE.md for instrument provenance.

export type AnswerScale = 'freq' | 'change' | 'limit';

export interface SurveyItemMeta extends ItemDefinition {
  promptKey: string;
  answerScale: AnswerScale;
}

function answerScaleFor(item: ItemDefinition): AnswerScale {
  // Map scale range to which scale-label set to use
  if (item.id === 'Q3') return 'change'; // 1-5 change scale
  if (item.id.startsWith('Q4.')) return 'limit'; // 1-5 limitation scale
  return 'freq'; // 1-6 frequency scale (default for Q1, Q5, Q6, Q7, Q8)
}

export const SURVEY_ITEMS: SurveyItemMeta[] = ITEM_DEFINITIONS.map((def) => ({
  ...def,
  promptKey: `item.${def.id}`,
  answerScale: answerScaleFor(def),
}));

export function itemById(id: ItemId): SurveyItemMeta | undefined {
  return SURVEY_ITEMS.find((i) => i.id === id);
}

export function answerOptionsForScale(
  scale: AnswerScale,
  range: readonly [number, number]
): { value: number; key: string }[] {
  const [min, max] = range;
  const out: { value: number; key: string }[] = [];
  for (let v = min; v <= max; v += 1) {
    out.push({ value: v, key: `answer.scale.${scale}.${v}` });
  }
  return out;
}
