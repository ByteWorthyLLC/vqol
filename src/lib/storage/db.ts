import { openDB, type IDBPDatabase } from 'idb';
import type {
  MetaRecord,
  ScoreRecord,
  SessionId,
  SessionRecord,
} from './types';
import type { ItemId, AnswerValue } from '../scoring/types';

interface VqolDb {
  sessions: {
    key: SessionId;
    value: SessionRecord;
    indexes: { 'by-status': string };
  };
  scores: {
    key: string;
    value: ScoreRecord;
    indexes: { 'by-session': SessionId; 'by-calculated': number };
  };
  meta: {
    key: string;
    value: MetaRecord;
  };
}

const DB_NAME = 'vqol-data';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VqolDb>> | null = null;

function getDb(): Promise<IDBPDatabase<VqolDb>> {
  if (!dbPromise) {
    dbPromise = openDB<VqolDb>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('by-status', 'status');

        const scores = db.createObjectStore('scores', { keyPath: 'id' });
        scores.createIndex('by-session', 'sessionId');
        scores.createIndex('by-calculated', 'calculatedAt');

        db.createObjectStore('meta', { keyPath: 'key' });
      },
    });
  }
  return dbPromise;
}

// Test-only: reset the singleton between tests so fake-indexeddb starts clean.
export function _resetForTests(): void {
  dbPromise = null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Sessions
// ──────────────────────────────────────────────────────────────────────────────

export async function createSession(
  init: Pick<SessionRecord, 'lockedLocale'>
): Promise<SessionRecord> {
  const session: SessionRecord = {
    id: crypto.randomUUID(),
    startedAt: Date.now(),
    lockedLocale: init.lockedLocale,
    status: 'draft',
    answers: {},
    dwellMs: {},
  };
  const db = await getDb();
  await db.put('sessions', session);
  return session;
}

export async function getSession(
  id: SessionId
): Promise<SessionRecord | undefined> {
  const db = await getDb();
  return db.get('sessions', id);
}

export async function getActiveDraft(): Promise<SessionRecord | undefined> {
  const db = await getDb();
  const drafts = await db.getAllFromIndex('sessions', 'by-status', 'draft');
  drafts.sort((a, b) => b.startedAt - a.startedAt);
  return drafts[0];
}

export async function recordAnswer(
  sessionId: SessionId,
  itemId: ItemId,
  value: AnswerValue,
  dwellMs: number
): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sessions', 'readwrite');
  const existing = await tx.store.get(sessionId);
  if (!existing) throw new Error(`Session ${sessionId} not found`);
  if (existing.status !== 'draft') {
    throw new Error(`Cannot record answer on ${existing.status} session`);
  }
  existing.answers[itemId] = value;
  existing.dwellMs[itemId] = dwellMs;
  await tx.store.put(existing);
  await tx.done;
}

export async function completeSession(
  sessionId: SessionId
): Promise<SessionRecord> {
  const db = await getDb();
  const tx = db.transaction('sessions', 'readwrite');
  const existing = await tx.store.get(sessionId);
  if (!existing) throw new Error(`Session ${sessionId} not found`);
  existing.status = 'completed';
  existing.completedAt = Date.now();
  await tx.store.put(existing);
  await tx.done;
  return existing;
}

export async function discardSession(sessionId: SessionId): Promise<void> {
  const db = await getDb();
  const tx = db.transaction('sessions', 'readwrite');
  const existing = await tx.store.get(sessionId);
  if (!existing) return;
  existing.status = 'discarded';
  await tx.store.put(existing);
  await tx.done;
}

export async function listCompletedSessions(): Promise<SessionRecord[]> {
  const db = await getDb();
  const sessions = await db.getAllFromIndex(
    'sessions',
    'by-status',
    'completed'
  );
  return sessions.sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
}

// ──────────────────────────────────────────────────────────────────────────────
// Scores
// ──────────────────────────────────────────────────────────────────────────────

export async function saveScore(
  record: Omit<ScoreRecord, 'id' | 'calculatedAt'>
): Promise<ScoreRecord> {
  const full: ScoreRecord = {
    id: crypto.randomUUID(),
    calculatedAt: Date.now(),
    ...record,
  };
  const db = await getDb();
  await db.put('scores', full);
  return full;
}

export async function listScores(): Promise<ScoreRecord[]> {
  const db = await getDb();
  const all = await db.getAll('scores');
  return all.sort((a, b) => a.calculatedAt - b.calculatedAt);
}

export async function latestScore(): Promise<ScoreRecord | undefined> {
  const all = await listScores();
  return all[all.length - 1];
}

// ──────────────────────────────────────────────────────────────────────────────
// Meta
// ──────────────────────────────────────────────────────────────────────────────

export async function getMeta<T = unknown>(key: string): Promise<T | undefined> {
  const db = await getDb();
  const record = await db.get('meta', key);
  return record?.value as T | undefined;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  const db = await getDb();
  await db.put('meta', { key, value, updatedAt: Date.now() });
}

// ──────────────────────────────────────────────────────────────────────────────
// Wipe (for "wipe everything" feature, P3)
// ──────────────────────────────────────────────────────────────────────────────

export async function wipeAll(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(['sessions', 'scores', 'meta'], 'readwrite');
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('scores').clear(),
    tx.objectStore('meta').clear(),
  ]);
  await tx.done;
}
