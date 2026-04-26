import { describe, expect, it } from 'vitest';
import { buildFollowUpIcs, calendarFilename } from './ics';
import type { ScoreRecord } from '../storage/types';

const SCORE: ScoreRecord = {
  id: 'score-1',
  sessionId: 'session-1',
  qolTscore: 50,
  symTscore: 48,
  calculatedAt: Date.UTC(2026, 0, 1),
};

describe('follow-up ICS export', () => {
  it('builds all expected follow-up events without score values', () => {
    const ics = buildFollowUpIcs(
      SCORE,
      { practiceId: 'example-vein-center', practiceName: 'Example Vein Center' },
      Date.UTC(2026, 0, 2, 12)
    );

    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect(ics).toContain('SUMMARY:1-month VEINES follow-up');
    expect(ics).toContain('DTSTART;VALUE=DATE:20260131');
    expect(ics).not.toContain('qolTscore');
    expect(ics).not.toContain('50');
  });

  it('names files by score date', () => {
    expect(calendarFilename(SCORE)).toBe('vqol-followups-20260101.ics');
  });
});
