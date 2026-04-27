# Device Verification

Last updated: 2026-04-27

## Automated Smoke

Run:

```bash
npm run smoke:devices
```

This launches the deployed app in isolated browser contexts and checks:

- `#/launch`
- `#/studio`
- `#/forge`
- `#/proof`
- `#/results?demo=1`
- The clinician PDF export button calls `window.print()`

Latest generated report:

- [device-smoke-report.json](assets/device-smoke-report.json)
- [vqol-demo-report.pdf](assets/vqol-demo-report.pdf)

Latest result:

| Target | Status |
|---|---|
| Desktop Chromium layout | Passed |
| Android Chrome-sized touch layout | Passed |
| iOS Safari-sized touch layout | Passed |

## Lighthouse Accessibility

Run:

```bash
npm run check:lighthouse
```

The CI `npm run verify` gate now runs Lighthouse accessibility checks against
the production build for home, demo results, lab, studio, forge, launch, proof,
and poster routes. The current threshold is `95%`.

## Physical Device Boundary

The automated checks above cover layout, routing, PDF-export invocation, and
accessibility scoring. They are not a substitute for physical device testing.

Still requiring a physical device or a paid device cloud before a tagged public
release:

- iOS Safari Home Screen install and persistence behavior.
- Android Chrome install and notification behavior.
- Native print/save dialogs on iOS Safari, Android Chrome, desktop Chrome, and
  desktop Firefox.
- VoiceOver and NVDA screen-reader navigation.

Those checks cannot be honestly marked complete from this headless environment.
