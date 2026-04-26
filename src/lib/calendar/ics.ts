import type { PracticeConfig } from '../practice-config/types';
import type { ScoreRecord } from '../storage/types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface FollowUpWindow {
  key: string;
  label: string;
  daysAfterScore: number;
}

export const FOLLOW_UP_WINDOWS: readonly FollowUpWindow[] = [
  { key: '1mo', label: '1-month VEINES follow-up', daysAfterScore: 30 },
  { key: '3mo', label: '3-month VEINES follow-up', daysAfterScore: 90 },
  { key: '6mo', label: '6-month VEINES follow-up', daysAfterScore: 180 },
  { key: '12mo', label: '12-month VEINES follow-up', daysAfterScore: 365 },
];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function dateStamp(ts: number): string {
  const d = new Date(ts);
  return [
    d.getUTCFullYear(),
    pad(d.getUTCMonth() + 1),
    pad(d.getUTCDate()),
  ].join('');
}

function utcStamp(ts: number): string {
  const d = new Date(ts);
  return `${dateStamp(ts)}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildFollowUpIcs(
  score: ScoreRecord,
  config: Pick<PracticeConfig, 'practiceName' | 'practiceId'>,
  now = Date.now()
): string {
  const practiceId = config.practiceId ?? config.practiceName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VQOL//Follow-up Calendar//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const window of FOLLOW_UP_WINDOWS) {
    const start = score.calculatedAt + window.daysAfterScore * DAY_MS;
    const end = start + DAY_MS;
    lines.push(
      'BEGIN:VEVENT',
      `UID:vqol-${practiceId}-${score.id}-${window.key}@local`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART;VALUE=DATE:${dateStamp(start)}`,
      `DTEND;VALUE=DATE:${dateStamp(end)}`,
      `SUMMARY:${escapeIcs(window.label)}`,
      `DESCRIPTION:${escapeIcs(`Repeat VEINES-QOL/Sym for ${config.practiceName}. Higher T-score means better status. No survey data is included in this calendar file.`)}`,
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

export function calendarFilename(score: ScoreRecord): string {
  return `vqol-followups-${dateStamp(score.calculatedAt)}.ics`;
}

export function downloadTextFile(filename: string, body: string, mime: string): void {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
