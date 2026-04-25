import type { ItemId, AnswerValue } from '../scoring/types';

export type SessionId = string;
export type Locale = 'en' | 'es' | 'fr' | 'de';

export interface SessionRecord {
  id: SessionId;
  startedAt: number;
  completedAt?: number;
  lockedLocale: Locale;
  status: 'draft' | 'completed' | 'discarded';
  // Answers stored as a plain object for IndexedDB cloning friendliness
  answers: Record<ItemId, AnswerValue>;
  // Per-question dwell times (ms), keyed by item id, for the "did you read?" guard
  dwellMs: Record<ItemId, number>;
}

export interface ScoreRecord {
  id: string;
  sessionId: SessionId;
  qolTscore: number;
  symTscore: number;
  calculatedAt: number;
}

export type MetaKey =
  | 'install_state'
  | 'last_resume_prompt_at'
  | 'notification_cap_v1'
  | 'notification_cap_v3'
  | 'notification_cap_v6'
  | 'notification_cap_v12';

export interface MetaRecord {
  key: MetaKey | string;
  value: unknown;
  updatedAt: number;
}
