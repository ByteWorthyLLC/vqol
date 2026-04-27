#!/usr/bin/env -S node --experimental-strip-types
// Validates messages/{locale}.json files:
//   - Empty strings in any non-EN file -> fail
//   - Keys in en that are missing in any other locale -> fail
//   - Keys in another locale that are missing in en (drift) -> fail
//   - Locales not in the validated allowlist -> warn

import { readdirSync, readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const MESSAGES_DIR = resolve('messages');
const VALIDATED_LOCALES = new Set(['en', 'es', 'fr', 'de', 'it', 'nl', 'pt']);
const REQUIRED_LOCALES = ['en', 'es', 'fr', 'de'];

function loadJson(path: string): Record<string, string> {
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, string>;
}

function main(): void {
  let exitCode = 0;
  const files = readdirSync(MESSAGES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => ({ locale: basename(f, '.json'), path: resolve(MESSAGES_DIR, f) }));

  console.log(`Found ${files.length} locale file(s) in ${MESSAGES_DIR}.`);

  // Allowlist check
  for (const f of files) {
    if (!VALIDATED_LOCALES.has(f.locale)) {
      console.warn(
        `⚠ Locale "${f.locale}" is not in the validated-translation allowlist.`
      );
      console.warn(
        `  Only en/es/fr/de/it/nl/pt have published validated VEINES-QOL/Sym translations.`
      );
      console.warn(
        `  Adding others requires a citation in CONTRIBUTING.md per validated-translations-only policy.`
      );
    }
  }

  // Required locales present
  for (const required of REQUIRED_LOCALES) {
    if (!files.find((f) => f.locale === required)) {
      console.error(`✗ Missing required locale file: messages/${required}.json`);
      exitCode = 1;
    }
  }

  // Empty-string check (non-EN files)
  for (const f of files) {
    if (f.locale === 'en') continue;
    const contents = loadJson(f.path);
    const empties = Object.entries(contents).filter(([, v]) => v === '');
    if (empties.length > 0) {
      console.error(
        `✗ ${f.locale}: ${empties.length} empty translation(s). fill or remove:`
      );
      for (const [k] of empties) console.error(`    ${k}`);
      exitCode = 1;
    }
  }

  // Key drift check
  const enFile = files.find((f) => f.locale === 'en');
  if (!enFile) return process.exit(exitCode || 1);
  const enKeys = new Set(Object.keys(loadJson(enFile.path)));

  for (const f of files) {
    if (f.locale === 'en') continue;
    const otherKeys = new Set(Object.keys(loadJson(f.path)));
    const missing = [...enKeys].filter((k) => !otherKeys.has(k));
    const extra = [...otherKeys].filter((k) => !enKeys.has(k));
    if (missing.length > 0) {
      console.error(`✗ ${f.locale}: ${missing.length} key(s) missing vs en:`);
      for (const k of missing) console.error(`    ${k}`);
      exitCode = 1;
    }
    if (extra.length > 0) {
      console.error(`✗ ${f.locale}: ${extra.length} key(s) not in en (drift):`);
      for (const k of extra) console.error(`    ${k}`);
      exitCode = 1;
    }
  }

  if (exitCode === 0) {
    console.log('✓ All locale files are present, complete, and aligned.');
  }
  process.exit(exitCode);
}

main();
