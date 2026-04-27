import type { PracticeConfig, PracticeInstrument } from '../practice-config/types';

export interface PracticeForgeDraft {
  practiceName: string;
  practiceId: string;
  email: string;
  websiteUrl: string;
  primaryColor: string;
  instrumentMode: PracticeInstrument['mode'];
  aggregateSubmit: boolean;
  aggregateEndpoint: string;
}

export function slugifyPracticeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || 'practice'
  );
}

export function draftFromConfig(config: PracticeConfig): PracticeForgeDraft {
  return {
    practiceName: config.practiceName,
    practiceId: config.practiceId ?? slugifyPracticeName(config.practiceName),
    email: config.primaryContact.email ?? '',
    websiteUrl: config.primaryContact.websiteUrl ?? '',
    primaryColor: config.branding.primaryColor,
    instrumentMode: config.instrument.mode,
    aggregateSubmit: config.features.aggregateSubmit,
    aggregateEndpoint: config.features.aggregateEndpoint ?? '',
  };
}

export function configFromDraft(
  base: PracticeConfig,
  draft: PracticeForgeDraft
): PracticeConfig {
  const mode = draft.instrumentMode;
  const permissioned = mode === 'permissioned-veines';
  return {
    ...base,
    practiceName: draft.practiceName.trim() || base.practiceName,
    practiceId: slugifyPracticeName(draft.practiceId || draft.practiceName),
    primaryContact: {
      ...base.primaryContact,
      email: draft.email.trim() || undefined,
      websiteUrl: draft.websiteUrl.trim() || undefined,
    },
    branding: {
      ...base.branding,
      primaryColor: draft.primaryColor,
    },
    instrument: {
      ...base.instrument,
      mode,
      licenseStatus: permissioned ? 'permission-granted' : base.instrument.licenseStatus,
    },
    features: {
      aggregateSubmit: draft.aggregateSubmit,
      aggregateEndpoint: draft.aggregateSubmit ? draft.aggregateEndpoint.trim() : null,
    },
  };
}

export function serializePracticeConfig(config: PracticeConfig): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}
