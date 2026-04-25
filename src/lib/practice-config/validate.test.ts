import { describe, it, expect } from 'vitest';
import { validatePracticeConfig, formatErrors } from './validate';
import { contrastRatio, auditBranding } from './contrast';

const VALID_CONFIG = {
  schemaVersion: 1,
  practiceName: 'Example Vein Center',
  logoUrl: './logo.png',
  primaryContact: {
    phone: '+1 555 555 5555',
    email: 'info@example-vein.com',
    websiteUrl: 'https://example-vein.com',
  },
  branding: {
    primaryColor: '#2a5a8a',
    primaryTextColor: '#ffffff',
    backgroundColor: '#ffffff',
    foregroundColor: '#1a1a1a',
  },
  locale: {
    default: 'en',
    available: ['en', 'es', 'fr', 'de'],
  },
  features: {
    aggregateSubmit: false,
    aggregateEndpoint: null,
  },
};

describe('validatePracticeConfig', () => {
  it('accepts a fully valid config', () => {
    const result = validatePracticeConfig(VALID_CONFIG);
    expect(result.ok).toBe(true);
  });

  it('rejects non-object input with a path-rooted error', () => {
    const result = validatePracticeConfig('not an object');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[0]?.path).toBe('/');
  });

  it('rejects missing practiceName', () => {
    const bad = { ...VALID_CONFIG };
    delete (bad as Record<string, unknown>).practiceName;
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'practiceName')).toBe(true);
    }
  });

  it('rejects malformed hex color with field-specific message', () => {
    const bad = {
      ...VALID_CONFIG,
      branding: { ...VALID_CONFIG.branding, primaryColor: 'red' },
    };
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find((e) => e.path === 'branding.primaryColor');
      expect(err?.message).toContain('hex');
    }
  });

  it('rejects unsupported locale in available array', () => {
    const bad = {
      ...VALID_CONFIG,
      locale: { default: 'en', available: ['en', 'klingon'] },
    };
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(
        result.errors.some((e) => e.path === 'locale.available')
      ).toBe(true);
    }
  });

  it('rejects default locale not in available', () => {
    const bad = {
      ...VALID_CONFIG,
      locale: { default: 'fr', available: ['en', 'es'] },
    };
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.path === 'locale.default')).toBe(true);
    }
  });

  it('requires aggregateEndpoint when aggregateSubmit is true (HIPAA-aware msg)', () => {
    const bad = {
      ...VALID_CONFIG,
      features: { aggregateSubmit: true, aggregateEndpoint: null },
    };
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const err = result.errors.find(
        (e) => e.path === 'features.aggregateEndpoint'
      );
      expect(err?.message).toMatch(/https:\/\//);
      expect(err?.message).toMatch(/BAA/);
    }
  });

  it('rejects http:// aggregate endpoint (HTTPS-only)', () => {
    const bad = {
      ...VALID_CONFIG,
      features: {
        aggregateSubmit: true,
        aggregateEndpoint: 'http://insecure.example.com/endpoint',
      },
    };
    const result = validatePracticeConfig(bad);
    expect(result.ok).toBe(false);
  });

  it('formatErrors renders a multi-line bullet list', () => {
    const errs = [
      { path: 'a', message: 'bad' },
      { path: 'b.c', message: 'worse' },
    ];
    const out = formatErrors(errs);
    expect(out).toContain('• a: bad');
    expect(out).toContain('• b.c: worse');
  });
});

describe('contrast', () => {
  it('returns ~21:1 for black-on-white', () => {
    const r = contrastRatio('#000000', '#ffffff');
    expect(r).toBeGreaterThan(20);
  });

  it('returns 1:1 for identical colors', () => {
    const r = contrastRatio('#aabbcc', '#aabbcc');
    expect(r).toBeCloseTo(1, 4);
  });

  it('audit reports body-text + button + accent ratios', () => {
    const reports = auditBranding({
      primaryColor: '#2a5a8a',
      primaryTextColor: '#ffffff',
      backgroundColor: '#ffffff',
      foregroundColor: '#1a1a1a',
    });
    expect(reports).toHaveLength(3);
    expect(reports.every((r) => r.meetsAa)).toBe(true);
  });

  it('audit flags WCAG-AA failures', () => {
    const reports = auditBranding({
      primaryColor: '#bbbbbb',
      primaryTextColor: '#cccccc', // Insufficient on grey
      backgroundColor: '#ffffff',
      foregroundColor: '#999999', // Body text fails AA
    });
    expect(reports.some((r) => !r.meetsAa)).toBe(true);
  });
});
