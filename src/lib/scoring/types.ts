export type ItemId = string;

export type Subscale = 'qol' | 'sym' | 'both';

export interface ItemDefinition {
  id: ItemId;
  subscale: Subscale;
  reverseScored: boolean;
  scaleRange: readonly [number, number];
}

export type AnswerValue = number;

export type Answers = ReadonlyMap<ItemId, AnswerValue>;

export interface NormativeConstants {
  itemId: ItemId;
  mean: number;
  sd: number;
}

export type ScoringResult =
  | { status: 'ok'; qolTscore: number; symTscore: number; itemsScored: number }
  | { status: 'incomplete'; missing: ItemId[]; threshold: number };
