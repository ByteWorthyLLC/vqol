import { getMeta, setMeta } from '../storage/db';
import type { ScoreRecord } from '../storage/types';

export interface ReminderInterval {
  key: 'v1' | 'v3' | 'v6' | 'v12';
  daysFromBaseline: number;
  labelKey: string; // i18n key for the visible reminder label
}

export const REMINDER_INTERVALS: readonly ReminderInterval[] = Object.freeze([
  { key: 'v1', daysFromBaseline: 30, labelKey: 'reminder.1mo' },
  { key: 'v3', daysFromBaseline: 90, labelKey: 'reminder.3mo' },
  { key: 'v6', daysFromBaseline: 180, labelKey: 'reminder.6mo' },
  { key: 'v12', daysFromBaseline: 365, labelKey: 'reminder.12mo' },
]);

export const MAX_FIRES_PER_INTERVAL = 2; // E-4: reminder fatigue prevention

interface CapState {
  firedCount: number;
  acknowledged: boolean;
  lastFiredAt?: number;
}

const DEFAULT_CAP: CapState = { firedCount: 0, acknowledged: false };

function metaKey(intervalKey: ReminderInterval['key']): string {
  return `notification_cap_${intervalKey}`;
}

export async function getCapState(
  intervalKey: ReminderInterval['key']
): Promise<CapState> {
  const stored = await getMeta<CapState>(metaKey(intervalKey));
  return stored ?? { ...DEFAULT_CAP };
}

export async function setCapState(
  intervalKey: ReminderInterval['key'],
  state: CapState
): Promise<void> {
  await setMeta(metaKey(intervalKey), state);
}

export interface DueReminder {
  interval: ReminderInterval;
  daysOverdue: number;
  capState: CapState;
}

export async function findDueReminders(
  baseline: Pick<ScoreRecord, 'calculatedAt'> | undefined,
  now: number = Date.now()
): Promise<DueReminder[]> {
  if (!baseline) return [];
  const elapsedDays = Math.floor((now - baseline.calculatedAt) / (24 * 60 * 60 * 1000));
  const due: DueReminder[] = [];
  for (const interval of REMINDER_INTERVALS) {
    if (elapsedDays < interval.daysFromBaseline) continue;
    const capState = await getCapState(interval.key);
    if (capState.acknowledged) continue;
    if (capState.firedCount >= MAX_FIRES_PER_INTERVAL) continue;
    due.push({
      interval,
      daysOverdue: elapsedDays - interval.daysFromBaseline,
      capState,
    });
  }
  return due;
}

export async function recordFire(
  intervalKey: ReminderInterval['key'],
  now: number = Date.now()
): Promise<void> {
  const state = await getCapState(intervalKey);
  await setCapState(intervalKey, {
    ...state,
    firedCount: state.firedCount + 1,
    lastFiredAt: now,
  });
}

export async function acknowledge(
  intervalKey: ReminderInterval['key']
): Promise<void> {
  const state = await getCapState(intervalKey);
  await setCapState(intervalKey, { ...state, acknowledged: true });
}

export function notificationCapacity(state: CapState): {
  remainingFires: number;
  shouldUseInAppBanner: boolean;
} {
  const remainingFires = Math.max(0, MAX_FIRES_PER_INTERVAL - state.firedCount);
  return {
    remainingFires,
    shouldUseInAppBanner: remainingFires === 0 || state.acknowledged,
  };
}
