import { describe, expect, it } from 'vitest';
import { auditForkConfig, forkReadinessScore } from './audit';
import type { PracticeConfig } from '../practice-config/types';

const CONFIG: PracticeConfig = {
  schemaVersion: 1,
  practiceId: 'example-vein-center',
  practiceName: 'Example Vein Center',
  primaryContact: { websiteUrl: 'https://example.com' },
  branding: {
    primaryColor: '#2a5a8a',
    primaryTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
  },
  locale: { default: 'en', available: ['en', 'es'] },
  instrument: {
    mode: 'reference-only',
    licenseStatus: 'pending-permission',
  },
  features: { aggregateSubmit: false, aggregateEndpoint: null },
};

describe('fork audit', () => {
  it('scores a ready config at 100', () => {
    const items = auditForkConfig(CONFIG);
    expect(forkReadinessScore(items)).toBe(100);
  });

  it('flags missing contact path', () => {
    const items = auditForkConfig({ ...CONFIG, primaryContact: {} });
    const contact = items.find((item) => item.id === 'contact');
    expect(contact?.pass).toBe(false);
    expect(forkReadinessScore(items)).toBeLessThan(100);
  });
});
