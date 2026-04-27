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
- `#/device`
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

The CI `npm run verify` gate runs Lighthouse accessibility checks against a
representative production route set: home, fake demo results, launch, proof, and
Device Lab.
Local `npm run check:lighthouse` checks the wider route set: home, demo results,
lab, studio, forge, launch, proof, poster, and Device Lab. The current threshold
is `95%`.

## Device Lab

Open:

```text
https://byteworthyllc.github.io/vqol/#/device
```

The route turns manual hard gates into a repeatable evidence workflow:

- Runs runtime checks for user agent, viewport, display mode, storage,
  notification support, service-worker control, and cache visibility.
- Lets a tester record install, print/share/save, PDF, notification, and
  screen-reader checks.
- Downloads a JSON report.
- Builds a prefilled GitHub issue URL with the report body.

The related intake template is
`.github/ISSUE_TEMPLATE/device_verification.yml`.

## Physical Device Boundary

The automated checks above cover layout, routing, PDF-export invocation, and
accessibility scoring. They are not a substitute for physical device testing.

Still requiring a physical device, a paid device cloud, or a trusted community
report before a tagged patient-facing release:

- iOS Safari Home Screen install and persistence behavior.
- Android Chrome install and notification behavior.
- Native print/save dialogs on iOS Safari, Android Chrome, desktop Chrome, and
  desktop Firefox.
- VoiceOver and NVDA screen-reader navigation.

Those checks cannot be honestly marked complete from this headless environment,
but they now have a public route and issue template for collecting evidence.
