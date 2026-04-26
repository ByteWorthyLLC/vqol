import type { PracticeConfig } from '../practice-config/types';
import type { ScoreRecord } from '../storage/types';

export interface AggregatePayload {
  schemaVersion: 1;
  practiceId: string;
  sessionId: string;
  calculatedAt: number;
  scores: {
    qolTscore: number;
    symTscore: number;
  };
}

export type AggregateSubmitResult =
  | { status: 'skipped'; reason: 'disabled' | 'missing-endpoint' }
  | { status: 'submitted'; httpStatus: number }
  | { status: 'failed'; reason: string; httpStatus?: number };

export function practiceSlug(config: Pick<PracticeConfig, 'practiceId' | 'practiceName'>): string {
  return (
    config.practiceId ??
    config.practiceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  );
}

export function buildAggregatePayload(
  config: Pick<PracticeConfig, 'practiceId' | 'practiceName'>,
  score: ScoreRecord
): AggregatePayload {
  return {
    schemaVersion: 1,
    practiceId: practiceSlug(config),
    sessionId: score.sessionId,
    calculatedAt: score.calculatedAt,
    scores: {
      qolTscore: score.qolTscore,
      symTscore: score.symTscore,
    },
  };
}

export async function submitAggregateScore(
  config: PracticeConfig,
  score: ScoreRecord,
  fetcher: typeof fetch = fetch
): Promise<AggregateSubmitResult> {
  if (!config.features.aggregateSubmit) {
    return { status: 'skipped', reason: 'disabled' };
  }
  if (!config.features.aggregateEndpoint) {
    return { status: 'skipped', reason: 'missing-endpoint' };
  }

  try {
    const response = await fetcher(config.features.aggregateEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildAggregatePayload(config, score)),
      keepalive: true,
    });

    if (!response.ok) {
      return {
        status: 'failed',
        reason: `endpoint returned ${response.status}`,
        httpStatus: response.status,
      };
    }

    return { status: 'submitted', httpStatus: response.status };
  } catch (err) {
    return {
      status: 'failed',
      reason: err instanceof Error ? err.message : String(err),
    };
  }
}
