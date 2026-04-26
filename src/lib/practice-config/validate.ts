import type {
  FieldError,
  PracticeConfig,
  ValidationResult,
} from './types';
import type { Locale } from '../storage/types';

const SUPPORTED_LOCALES: readonly Locale[] = ['en', 'es', 'fr', 'de'];
const INSTRUMENT_MODES = ['reference-only', 'permissioned-veines', 'bring-your-own'] as const;
const LICENSE_STATUSES = ['pending-permission', 'permission-granted', 'fallback-required'] as const;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const HTTPS_URL = /^https:\/\/.+/;
const HTTPS_OR_RELATIVE_URL = /^(https:\/\/|\.\/|\/).+/;
const PRACTICE_ID = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function pushIfMissing(
  errors: FieldError[],
  obj: Record<string, unknown>,
  field: string,
  path: string,
  message: string
): void {
  if (!(field in obj) || obj[field] === undefined || obj[field] === null) {
    errors.push({ path, message });
  }
}

function validateBranding(
  branding: unknown,
  errors: FieldError[]
): void {
  if (!isObject(branding)) {
    errors.push({ path: 'branding', message: 'must be an object with color fields' });
    return;
  }
  const colorFields = ['primaryColor', 'primaryTextColor', 'backgroundColor', 'foregroundColor'] as const;
  for (const field of colorFields) {
    const v = branding[field];
    if (!isString(v)) {
      errors.push({
        path: `branding.${field}`,
        message: `is required and must be a hex color like "#2a5a8a"`,
      });
    } else if (!HEX_COLOR.test(v)) {
      errors.push({
        path: `branding.${field}`,
        message: `must be a 6-digit hex color (got "${v}")`,
      });
    }
  }
}

function validateContact(
  contact: unknown,
  errors: FieldError[]
): void {
  if (!isObject(contact)) {
    errors.push({ path: 'primaryContact', message: 'must be an object (can have phone/email/websiteUrl)' });
    return;
  }
  if (contact.email !== undefined && contact.email !== null) {
    if (!isString(contact.email) || !contact.email.includes('@')) {
      errors.push({
        path: 'primaryContact.email',
        message: 'must be a valid email address if provided',
      });
    }
  }
  if (contact.websiteUrl !== undefined && contact.websiteUrl !== null) {
    if (!isString(contact.websiteUrl) || !HTTPS_URL.test(contact.websiteUrl)) {
      errors.push({
        path: 'primaryContact.websiteUrl',
        message: 'must be an https:// URL if provided',
      });
    }
  }
  // phone is free-form — not validated at the schema level
}

function validateLocale(
  locale: unknown,
  errors: FieldError[]
): void {
  if (!isObject(locale)) {
    errors.push({
      path: 'locale',
      message: 'must be an object with `default` and `available` fields',
    });
    return;
  }
  if (!isString(locale.default) || !SUPPORTED_LOCALES.includes(locale.default as Locale)) {
    errors.push({
      path: 'locale.default',
      message: `must be one of: ${SUPPORTED_LOCALES.join(', ')}`,
    });
  }
  if (!Array.isArray(locale.available) || locale.available.length === 0) {
    errors.push({
      path: 'locale.available',
      message: 'must be a non-empty array of locale codes',
    });
  } else {
    for (const code of locale.available) {
      if (!isString(code) || !SUPPORTED_LOCALES.includes(code as Locale)) {
        errors.push({
          path: 'locale.available',
          message: `unsupported locale "${String(code)}"; allowed: ${SUPPORTED_LOCALES.join(', ')}`,
        });
        break;
      }
    }
    if (
      isString(locale.default) &&
      !locale.available.includes(locale.default)
    ) {
      errors.push({
        path: 'locale.default',
        message: `default locale "${locale.default}" must be in locale.available`,
      });
    }
  }
}

function validateFeatures(
  features: unknown,
  errors: FieldError[]
): void {
  if (!isObject(features)) {
    errors.push({
      path: 'features',
      message: 'must be an object with feature flags',
    });
    return;
  }
  if (typeof features.aggregateSubmit !== 'boolean') {
    errors.push({
      path: 'features.aggregateSubmit',
      message: 'must be a boolean (default false)',
    });
  }
  const ep = features.aggregateEndpoint;
  if (features.aggregateSubmit === true) {
    if (!isString(ep) || !HTTPS_URL.test(ep)) {
      errors.push({
        path: 'features.aggregateEndpoint',
        message:
          'aggregateSubmit is enabled — endpoint must be an https:// URL. The deploying practice owns the BAA for this endpoint.',
      });
    }
  } else if (ep !== null && ep !== undefined && (!isString(ep) || !HTTPS_URL.test(ep))) {
    errors.push({
      path: 'features.aggregateEndpoint',
      message: 'must be null or an https:// URL',
    });
  }
}

function validateInstrument(
  instrument: unknown,
  errors: FieldError[]
): void {
  if (!isObject(instrument)) {
    errors.push({
      path: 'instrument',
      message: 'must declare mode and licenseStatus',
    });
    return;
  }
  if (!isString(instrument.mode) || !INSTRUMENT_MODES.includes(instrument.mode as typeof INSTRUMENT_MODES[number])) {
    errors.push({
      path: 'instrument.mode',
      message: `must be one of: ${INSTRUMENT_MODES.join(', ')}`,
    });
  }
  if (!isString(instrument.licenseStatus) || !LICENSE_STATUSES.includes(instrument.licenseStatus as typeof LICENSE_STATUSES[number])) {
    errors.push({
      path: 'instrument.licenseStatus',
      message: `must be one of: ${LICENSE_STATUSES.join(', ')}`,
    });
  }
  if (instrument.rightsHolder !== undefined && instrument.rightsHolder !== null && !isString(instrument.rightsHolder)) {
    errors.push({
      path: 'instrument.rightsHolder',
      message: 'must be a string if provided',
    });
  }
  if (
    instrument.mode === 'permissioned-veines' &&
    instrument.licenseStatus !== 'permission-granted'
  ) {
    errors.push({
      path: 'instrument.licenseStatus',
      message: 'permissioned-veines mode requires permission-granted status',
    });
  }
}

export function validatePracticeConfig(input: unknown): ValidationResult {
  const errors: FieldError[] = [];

  if (!isObject(input)) {
    return {
      ok: false,
      errors: [{ path: '/', message: 'practice.json must be a JSON object' }],
    };
  }

  if (input.schemaVersion !== 1) {
    errors.push({
      path: 'schemaVersion',
      message: `must be 1 (got ${JSON.stringify(input.schemaVersion)})`,
    });
  }

  pushIfMissing(errors, input, 'practiceName', 'practiceName', 'is required (the visible clinic name)');
  if ('practiceName' in input && !isString(input.practiceName)) {
    errors.push({ path: 'practiceName', message: 'must be a string' });
  }

  if ('practiceId' in input && input.practiceId !== undefined && input.practiceId !== null) {
    if (!isString(input.practiceId) || !PRACTICE_ID.test(input.practiceId)) {
      errors.push({
        path: 'practiceId',
        message: 'must be a lowercase slug, e.g. "example-vein-center"',
      });
    }
  }

  if ('logoUrl' in input && input.logoUrl !== undefined && input.logoUrl !== null) {
    if (!isString(input.logoUrl) || !HTTPS_OR_RELATIVE_URL.test(input.logoUrl)) {
      errors.push({
        path: 'logoUrl',
        message: 'must be an https:// URL or relative path (e.g. "./logo.png")',
      });
    }
  }

  validateContact(input.primaryContact, errors);
  validateBranding(input.branding, errors);
  validateLocale(input.locale, errors);
  validateInstrument(input.instrument, errors);
  validateFeatures(input.features, errors);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, config: input as unknown as PracticeConfig };
}

export function formatErrors(errors: FieldError[]): string {
  return errors.map((e) => `  • ${e.path}: ${e.message}`).join('\n');
}
