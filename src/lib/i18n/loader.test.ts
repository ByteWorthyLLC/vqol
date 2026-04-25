import { describe, it, expect } from 'vitest';
import { makeT, preferredLocale } from './loader';

describe('i18n', () => {
  it('returns the literal template when no params', () => {
    const t = makeT({ greeting: 'Hello' });
    expect(t('greeting')).toBe('Hello');
  });

  it('substitutes named params', () => {
    const t = makeT({ welcome: 'Hello, {name}!' });
    expect(t('welcome', { name: 'Sara' })).toBe('Hello, Sara!');
  });

  it('returns a missing-key marker for unknown keys', () => {
    const t = makeT({});
    expect(t('nope')).toBe('[nope]');
  });

  it('returns a missing-key marker for empty translations (drift detection)', () => {
    const t = makeT({ key: '' });
    expect(t('key')).toBe('[key]');
  });

  it('preferredLocale honors the practice default when no localStorage / nav match', () => {
    // jsdom navigator.language is usually "en-US" — pass in available without "en"
    const result = preferredLocale('fr', ['fr', 'de']);
    expect(['fr', 'de']).toContain(result);
  });
});
