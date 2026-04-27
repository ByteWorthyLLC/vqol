#!/usr/bin/env -S node --experimental-strip-types
// Validates the brand-color contrast in public/practice.json against WCAG 2.1 AA.
// Hard-fails CI on violation. Run via `npm run check:contrast`.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  validatePracticeConfig,
  formatErrors,
} from '../src/lib/practice-config/validate.ts';
import { auditBranding } from '../src/lib/practice-config/contrast.ts';

const PRACTICE_PATH = resolve('public/practice.json');

function main(): void {
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(PRACTICE_PATH, 'utf8'));
  } catch (err) {
    console.error(`✗ Could not read ${PRACTICE_PATH}: ${(err as Error).message}`);
    process.exit(1);
  }

  const v = validatePracticeConfig(raw);
  if (!v.ok) {
    console.error(`✗ practice.json failed schema validation:\n${formatErrors(v.errors)}`);
    process.exit(1);
  }

  const reports = auditBranding(v.config.branding);
  let failed = false;
  console.log('Contrast audit (WCAG 2.1 AA):');
  for (const r of reports) {
    const status = r.meetsAa ? '✓' : '✗';
    const ratio = r.ratio.toFixed(2);
    console.log(
      `  ${status} ${r.pair}. ${ratio}:1 (threshold ${r.threshold}:1)`
    );
    if (!r.meetsAa) failed = true;
  }
  if (failed) {
    console.error(
      '\n✗ Contrast violations detected. Adjust branding colors in public/practice.json.'
    );
    process.exit(1);
  }
  console.log('\n✓ All contrast pairs meet WCAG 2.1 AA.');
}

main();
