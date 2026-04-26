import { describe, expect, it, vi } from 'vitest';
import { buildAggregatePayload, submitAggregateScore } from './submit';
import type { PracticeConfig } from '../practice-config/types';
import type { ScoreRecord } from '../storage/types';

const SCORE: ScoreRecord = {
  id: 'score-1',
  sessionId: 'session-1',
  qolTscore: 47.2,
  symTscore: 45.8,
  calculatedAt: Date.UTC(2026, 0, 1),
};

const CONFIG: PracticeConfig = {
  schemaVersion: 1,
  practiceId: 'example-vein-center',
  practiceName: 'Example Vein Center',
  primaryContact: {},
  branding: {
    primaryColor: '#2a5a8a',
    primaryTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
  },
  locale: { default: 'en', available: ['en'] },
  instrument: {
    mode: 'reference-only',
    licenseStatus: 'pending-permission',
  },
  features: {
    aggregateSubmit: false,
    aggregateEndpoint: null,
  },
};

describe('aggregate submission', () => {
  it('builds a de-identified payload', () => {
    expect(buildAggregatePayload(CONFIG, SCORE)).toEqual({
      schemaVersion: 1,
      practiceId: 'example-vein-center',
      sessionId: 'session-1',
      calculatedAt: SCORE.calculatedAt,
      scores: {
        qolTscore: 47.2,
        symTscore: 45.8,
      },
    });
  });

  it('skips network calls when disabled', async () => {
    const fetcher = vi.fn();
    const result = await submitAggregateScore(CONFIG, SCORE, fetcher as unknown as typeof fetch);
    expect(result).toEqual({ status: 'skipped', reason: 'disabled' });
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('posts to the configured endpoint when enabled', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 204 });
    const result = await submitAggregateScore(
      {
        ...CONFIG,
        features: {
          aggregateSubmit: true,
          aggregateEndpoint: 'https://collector.example/vqol',
        },
      },
      SCORE,
      fetcher as unknown as typeof fetch
    );

    expect(result).toEqual({ status: 'submitted', httpStatus: 204 });
    expect(fetcher).toHaveBeenCalledWith(
      'https://collector.example/vqol',
      expect.objectContaining({
        method: 'POST',
        headers: { 'content-type': 'application/json' },
      })
    );
  });
});
