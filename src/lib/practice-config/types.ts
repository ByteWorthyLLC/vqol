import type { Locale } from '../storage/types';

export interface PracticeContact {
  phone?: string;
  email?: string;
  websiteUrl?: string;
}

export interface PracticeBranding {
  primaryColor: string;
  primaryTextColor: string;
  backgroundColor: string;
  foregroundColor: string;
}

export interface PracticeLocale {
  default: Locale;
  available: Locale[];
}

export interface PracticeFeatures {
  aggregateSubmit: boolean;
  aggregateEndpoint: string | null;
}

export interface PracticeInstrument {
  mode: 'reference-only' | 'permissioned-veines' | 'bring-your-own';
  licenseStatus: 'pending-permission' | 'permission-granted' | 'fallback-required';
  rightsHolder?: string;
}

export interface PracticeConfig {
  schemaVersion: 1;
  practiceId?: string;
  practiceName: string;
  logoUrl?: string;
  primaryContact: PracticeContact;
  branding: PracticeBranding;
  locale: PracticeLocale;
  instrument: PracticeInstrument;
  features: PracticeFeatures;
}

export interface FieldError {
  path: string;
  message: string;
}

export type ValidationResult =
  | { ok: true; config: PracticeConfig }
  | { ok: false; errors: FieldError[] };
