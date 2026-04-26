import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST_DIR = 'dist';
const SCANNED_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.webmanifest',
]);

const BANNED_PATTERNS: { label: string; pattern: RegExp }[] = [
  { label: 'Google Analytics / gtag', pattern: /\b(gtag|google-analytics|googletagmanager)\b/i },
  { label: 'Sentry', pattern: /\bsentry\b/i },
  { label: 'Plausible', pattern: /\bplausible\b/i },
  { label: 'PostHog', pattern: /\bposthog\b/i },
  { label: 'Segment', pattern: /\bsegment\.com\b/i },
  { label: 'Mixpanel', pattern: /\bmixpanel\b/i },
  { label: 'Amplitude', pattern: /\bamplitude\b/i },
  { label: 'Datadog RUM', pattern: /\b(datadog|dd-rum)\b/i },
  { label: 'Beacon API', pattern: /\bsendBeacon\b/i },
];

function extension(path: string): string {
  const idx = path.lastIndexOf('.');
  return idx === -1 ? '' : path.slice(idx);
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      out.push(...walk(path));
    } else if (SCANNED_EXTENSIONS.has(extension(path))) {
      out.push(path);
    }
  }
  return out;
}

function main(): void {
  try {
    statSync(DIST_DIR);
  } catch {
    throw new Error('dist/ does not exist. Run `npm run build` before telemetry audit.');
  }

  const findings: string[] = [];
  for (const file of walk(DIST_DIR)) {
    const rel = relative(process.cwd(), file);
    const text = readFileSync(file, 'utf8');
    for (const banned of BANNED_PATTERNS) {
      if (banned.pattern.test(text)) {
        findings.push(`${rel}: ${banned.label}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error('Telemetry audit failed. Unexpected telemetry signatures found:');
    for (const finding of findings) console.error(`  - ${finding}`);
    process.exit(1);
  }

  console.log('Telemetry audit passed: no analytics, error-monitoring, or beacon signatures found.');
}

main();
