import type { ItemDefinition, NormativeConstants } from './types';

// PLACEHOLDER constants — see INSTRUMENT-LICENSE.md.
// Real per-item normative means and SDs come from the LSHTM Scoring Manual
// (Lamping & Schroter, 2007). These placeholders preserve the algorithm shape
// so the engine produces deterministic outputs for testing without leaking
// the licensed instrument-content.
//
// Item id naming convention: Q{number}.{subitem}
// Subscale assignment per Lamping 2003: Q1+Q7 -> sym; Q1+Q3+Q4+Q5+Q6+Q7+Q8 -> qol.
// Q2 (time of day) is descriptive only and not present here.

const Q1_SUBITEMS = 9; // 9 symptoms × frequency
const Q4_SUBITEMS = 11; // 9-11 daily-activity limitations per published version

function buildItem(
  id: string,
  subscale: ItemDefinition['subscale'],
  reverseScored: boolean,
  scaleRange: readonly [number, number]
): ItemDefinition {
  return { id, subscale, reverseScored, scaleRange };
}

const itemDefs: ItemDefinition[] = [];

// Q1.1..Q1.9 — symptom frequency, scale 1-6, both subscales (NOT reverse-scored)
for (let i = 1; i <= Q1_SUBITEMS; i += 1) {
  itemDefs.push(buildItem(`Q1.${i}`, 'both', false, [1, 6]));
}

// Q3 — change over past year, scale 1-5, qol only, REVERSE-scored
itemDefs.push(buildItem('Q3', 'qol', true, [1, 5]));

// Q4.1..Q4.11 — daily-activity limitations, scale 1-5, qol only
for (let i = 1; i <= Q4_SUBITEMS; i += 1) {
  itemDefs.push(buildItem(`Q4.${i}`, 'qol', false, [1, 5]));
}

// Q5 — felt depressed, scale 1-6, qol only
itemDefs.push(buildItem('Q5', 'qol', false, [1, 6]));

// Q6 — worried about appearance, scale 1-6, qol only, REVERSE-scored
itemDefs.push(buildItem('Q6', 'qol', true, [1, 6]));

// Q7 — felt irritable, scale 1-6, both subscales, REVERSE-scored
itemDefs.push(buildItem('Q7', 'both', true, [1, 6]));

// Q8 — interfered with social activities, scale 1-6, qol only
itemDefs.push(buildItem('Q8', 'qol', false, [1, 6]));

export const ITEM_DEFINITIONS: readonly ItemDefinition[] = Object.freeze(itemDefs);

// PLACEHOLDER normative constants — uniform mean/SD across items so the
// algorithm shape is verifiable in tests. Real constants from Scoring Manual
// will replace these once LSHTM permission lands. The mid-point and reasonable
// SD let unit tests confirm: identical answers across all items -> T-score 50,
// best answers -> high T, worst answers -> low T.
const PLACEHOLDER_MEAN_BY_RANGE: Record<string, number> = {
  '1-5': 3,
  '1-6': 3.5,
};
const PLACEHOLDER_SD_BY_RANGE: Record<string, number> = {
  '1-5': 1.0,
  '1-6': 1.25,
};

export const NORMATIVE_CONSTANTS: readonly NormativeConstants[] = Object.freeze(
  ITEM_DEFINITIONS.map((item) => {
    const key = `${item.scaleRange[0]}-${item.scaleRange[1]}`;
    return {
      itemId: item.id,
      mean: PLACEHOLDER_MEAN_BY_RANGE[key] ?? 3,
      sd: PLACEHOLDER_SD_BY_RANGE[key] ?? 1,
    };
  })
);

export const QOL_ITEM_COUNT = ITEM_DEFINITIONS.filter(
  (i) => i.subscale === 'qol' || i.subscale === 'both'
).length;

export const SYM_ITEM_COUNT = ITEM_DEFINITIONS.filter(
  (i) => i.subscale === 'sym' || i.subscale === 'both'
).length;

export const SCORING_THRESHOLD = 0.8; // ≥ 80% items required to score
