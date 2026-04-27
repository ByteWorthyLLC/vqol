import { describe, expect, it } from 'vitest';
import { configFromDraft, draftFromConfig, serializePracticeConfig, slugifyPracticeName } from './config';
import type { PracticeConfig } from '../practice-config/types';

const CONFIG: PracticeConfig = {
  schemaVersion: 1,
  practiceId: 'example-vein-center',
  practiceName: 'Example Vein Center',
  primaryContact: { email: 'info@example.org', websiteUrl: 'https://example.org' },
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
  features: { aggregateSubmit: false, aggregateEndpoint: null },
};

describe('practice forge config', () => {
  it('slugifies practice names', () => {
    expect(slugifyPracticeName('North Shore Vein & Vascular')).toBe('north-shore-vein-vascular');
  });

  it('round-trips draft values into a config', () => {
    const draft = {
      ...draftFromConfig(CONFIG),
      practiceName: 'North Shore Vein',
      primaryColor: '#116644',
    };
    const next = configFromDraft(CONFIG, draft);
    expect(next.practiceName).toBe('North Shore Vein');
    expect(next.branding.primaryColor).toBe('#116644');
    expect(next.features.aggregateEndpoint).toBeNull();
  });

  it('serializes with a trailing newline', () => {
    expect(serializePracticeConfig(CONFIG).endsWith('\n')).toBe(true);
  });
});
