# Hard Gates

Last updated: 2026-04-27

## Closed

| Gate | Evidence |
|---|---|
| LSHTM inquiry sent | `.planning/legal/lshtm-inquiry-sent-2026-04-27.md`, `INSTRUMENT-LICENSE.md` status log |
| Legal-safe public posture | `public/practice.json` uses `instrument.mode: reference-only`; app text remains placeholder pending permission |
| Launch screenshots/GIF | `docs/assets/screenshots/`, `docs/assets/vqol-launch-tour.gif` |
| Social preview asset generated | `docs/assets/social-preview.svg`, `docs/assets/social-preview.png` |
| App-link Open Graph/Twitter preview | `index.html`, `public/assets/social-preview.png` |
| Public copy review | `docs/LAUNCH-COPY.md` |
| Accessibility CI gate | `npm run check:lighthouse` included in `npm run verify` |
| Device smoke automation | `npm run smoke:devices`, `docs/assets/device-smoke-report.json` |
| Device verification workflow | `#/device`, `src/lib/device/report.ts`, `.github/ISSUE_TEMPLATE/device_verification.yml` |
| PDF artifact smoke | `docs/assets/vqol-demo-report.pdf` |
| GitHub Actions Node 20 warning mitigation | workflows set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` |

## Still External

These cannot be truthfully completed from the headless repo environment:

| Gate | Reason |
|---|---|
| LSHTM written permission | Waiting on external rights-holder response |
| GitHub repository social-preview upload | Optional manual repository-settings upload remains unavailable here; app-link preview is now deployed through `public/assets/social-preview.png` |
| Physical iOS Safari install/persistence | Requires actual iOS hardware, device cloud, or a trusted `#/device` report; tracking issue #6 |
| Physical Android Chrome install/notification | Requires actual Android hardware, device cloud, or a trusted `#/device` report; tracking issue #7 |
| Native print/save dialogs | Headless automation verifies `window.print()` invocation; OS-native dialogs require `#/device` reports; tracking issue #8 |
| VoiceOver/NVDA manual audit | Requires assistive-technology runtime and human navigation, now tracked through `#/device` reports; tracking issue #9 |

## Release Rule

Do not tag `v0.1.0` until either:

1. LSHTM grants written permission for a permissioned VEINES-QOL/Sym mode, or
2. the release remains explicitly reference-only and does not bundle verbatim
   instrument text or LSHTM scoring constants.

Physical device and screen-reader checks should be recorded through Device Lab
reports before announcing a patient-facing public release.
