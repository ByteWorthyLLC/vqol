# Testing

## Current Test Coverage

- `src/lib/scoring/algorithm.test.ts`
- `src/lib/storage/db.test.ts`
- `src/lib/practice-config/validate.test.ts`
- `src/lib/i18n/loader.test.ts`
- `src/lib/pdf/print.test.ts`
- `src/lib/notifications/scheduler.test.ts`
- `src/lib/marketing/launchKit.test.ts`
- `src/lib/device/report.test.ts`

## Verification Commands

```bash
npm run check
npm test
npm run build
npm run check:lighthouse
npm run audit:telemetry
npm run audit:deps
npm run smoke:devices
npm run verify
```

## Manual Test Gaps

- iOS Safari print/PDF export.
- iOS PWA install and persistence.
- Android Chrome notification behavior.
- Desktop browser print output.
- VoiceOver and NVDA navigation.
- First trusted Device Lab reports for iOS Safari, Android Chrome, desktop print, and VoiceOver/NVDA.

## Risk-Based Test Guidance

- Any scoring change needs focused unit tests.
- Any storage schema change needs migration tests.
- Any practice config change needs validator tests.
- Any user-visible string change needs translation validation.
- Any chart/export change needs browser-level smoke testing.
- Any device, install, print, or assistive-technology claim needs either automated coverage or a Device Lab report path.
