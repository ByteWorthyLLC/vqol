import { describe, it, expect, beforeEach } from 'vitest';
import {
  REMINDER_INTERVALS,
  MAX_FIRES_PER_INTERVAL,
  findDueReminders,
  recordFire,
  acknowledge,
  notificationCapacity,
  getCapState,
} from './scheduler';
import { _resetForTests, wipeAll } from '../storage/db';

const DAY_MS = 24 * 60 * 60 * 1000;

beforeEach(async () => {
  try { await wipeAll(); } catch { /* ignore */ }
  _resetForTests();
});

describe('reminder scheduler', () => {
  it('exposes 4 intervals: 1mo / 3mo / 6mo / 1yr', () => {
    expect(REMINDER_INTERVALS).toHaveLength(4);
    expect(REMINDER_INTERVALS.map((i) => i.daysFromBaseline)).toEqual([
      30, 90, 180, 365,
    ]);
  });

  it('returns no due reminders when no baseline exists', async () => {
    const due = await findDueReminders(undefined);
    expect(due).toHaveLength(0);
  });

  it('returns 1mo reminder once 30 days have passed', async () => {
    const baseline = { calculatedAt: Date.now() - 31 * DAY_MS };
    const due = await findDueReminders(baseline);
    expect(due).toHaveLength(1);
    expect(due[0]?.interval.key).toBe('v1');
  });

  it('returns multiple due reminders when several intervals elapsed', async () => {
    const baseline = { calculatedAt: Date.now() - 200 * DAY_MS };
    const due = await findDueReminders(baseline);
    expect(due.map((d) => d.interval.key)).toEqual(['v1', 'v3', 'v6']);
  });

  it('skips a reminder once acknowledged', async () => {
    const baseline = { calculatedAt: Date.now() - 31 * DAY_MS };
    await acknowledge('v1');
    const due = await findDueReminders(baseline);
    expect(due).toHaveLength(0);
  });

  it('caps fires at MAX_FIRES_PER_INTERVAL (E-4)', async () => {
    const baseline = { calculatedAt: Date.now() - 31 * DAY_MS };
    for (let i = 0; i < MAX_FIRES_PER_INTERVAL; i += 1) {
      await recordFire('v1');
    }
    const due = await findDueReminders(baseline);
    expect(due).toHaveLength(0);
    const state = await getCapState('v1');
    expect(state.firedCount).toBe(MAX_FIRES_PER_INTERVAL);
  });

  it('notificationCapacity flips to in-app banner after cap', () => {
    const fresh = { firedCount: 0, acknowledged: false };
    const capped = { firedCount: MAX_FIRES_PER_INTERVAL, acknowledged: false };
    const ackd = { firedCount: 0, acknowledged: true };
    expect(notificationCapacity(fresh).shouldUseInAppBanner).toBe(false);
    expect(notificationCapacity(capped).shouldUseInAppBanner).toBe(true);
    expect(notificationCapacity(ackd).shouldUseInAppBanner).toBe(true);
  });
});
