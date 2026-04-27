import { describe, it, expect, beforeEach } from 'vitest';
import {
  _resetForTests,
  createSession,
  getActiveDraft,
  recordAnswer,
  completeSession,
  listCompletedSessions,
  saveScore,
  listScores,
  latestScore,
  getMeta,
  setMeta,
  wipeAll,
} from './db';

beforeEach(async () => {
  // Wipe between tests so the singleton DB is empty for each case
  // (fake-indexeddb persists within a Vitest run otherwise)
  try {
    await wipeAll();
  } catch {
    // First run: DB doesn't exist yet. fine
  }
  _resetForTests();
});

describe('storage layer', () => {
  it('creates a draft session and surfaces it as the active draft', async () => {
    const created = await createSession({ lockedLocale: 'en' });
    const active = await getActiveDraft();
    expect(active?.id).toBe(created.id);
    expect(active?.status).toBe('draft');
    expect(active?.lockedLocale).toBe('en');
  });

  it('records an answer and persists it on the session', async () => {
    const session = await createSession({ lockedLocale: 'en' });
    await recordAnswer(session.id, 'Q1.1', 4, 1200);
    const reread = await getActiveDraft();
    expect(reread?.answers['Q1.1']).toBe(4);
    expect(reread?.dwellMs['Q1.1']).toBe(1200);
  });

  it('refuses to record an answer on a completed session', async () => {
    const session = await createSession({ lockedLocale: 'en' });
    await completeSession(session.id);
    await expect(
      recordAnswer(session.id, 'Q1.1', 4, 1200)
    ).rejects.toThrow(/Cannot record answer/);
  });

  it('moves a session from draft to completed', async () => {
    const session = await createSession({ lockedLocale: 'en' });
    const completed = await completeSession(session.id);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBeGreaterThan(0);
    const completedList = await listCompletedSessions();
    expect(completedList.find((s) => s.id === session.id)).toBeDefined();
    const noDraft = await getActiveDraft();
    expect(noDraft).toBeUndefined();
  });

  it('saves a score and retrieves the latest', async () => {
    const session = await createSession({ lockedLocale: 'en' });
    await completeSession(session.id);
    await saveScore({ sessionId: session.id, qolTscore: 47.2, symTscore: 52.1 });
    const latest = await latestScore();
    expect(latest?.qolTscore).toBe(47.2);
    expect(latest?.symTscore).toBe(52.1);
    const all = await listScores();
    expect(all).toHaveLength(1);
  });

  it('persists meta values', async () => {
    await setMeta('install_state', 'pending');
    const v = await getMeta<string>('install_state');
    expect(v).toBe('pending');
  });

  it('wipes all stores cleanly', async () => {
    const session = await createSession({ lockedLocale: 'en' });
    await saveScore({ sessionId: session.id, qolTscore: 50, symTscore: 50 });
    await setMeta('install_state', 'installed');

    await wipeAll();

    expect(await getActiveDraft()).toBeUndefined();
    expect(await listScores()).toHaveLength(0);
    expect(await getMeta('install_state')).toBeUndefined();
  });
});
