# vqol Agent Context

## Project

vqol is a static, installable Svelte PWA for patient-owned VEINES-QOL/Sym tracking in vein and vascular care. Practices fork it, edit `public/practice.json`, and deploy a branded copy without a backend.

## Current GSD State

- Phase 0 legal/provenance package: deliverables complete, LSHTM inquiry sent and response pending.
- Phase 1 vertical slice: complete.
- Phase 2 white-label + i18n: complete.
- Phase 3 chart/PDF/reminders/PWA: complete.
- Phase 4 repo launch readiness: active, with Pages demo, launch assets, and Device Lab evidence workflow live.
- Phase 5 aggregate submit + cluster extraction: started; optional aggregate submit is implemented and disabled by default.
- Phase 6/7 creative and viral functionality: complete, with Outcomes Studio, Practice Forge, Launch Kit, QR poster, proof surfaces, and Device Lab.

Read `.planning/STATE.md` before starting work.

## Stack

- Svelte 5
- Vite 6
- TypeScript
- `idb` for IndexedDB
- uPlot for results charting
- vite-plugin-pwa
- Vitest + jsdom + fake-indexeddb

## Core Architecture

- `src/App.svelte`: boot, practice config, locale load, hash route selection.
- `src/routes/`: Home, Survey, Results, and route helpers.
- `src/lib/scoring/`: pure scoring logic and item metadata.
- `src/lib/storage/`: the only IndexedDB access layer.
- `src/lib/practice-config/`: `practice.json` validation and CSS variable branding.
- `src/lib/i18n/`: JSON message loading and interpolation.
- `src/lib/chart/`: lazy uPlot chart.
- `src/lib/pdf/`: `window.print()` export helper.
- `src/lib/notifications/`: reminder scheduling and Notification API wrappers.
- `src/lib/device/`: Device Lab report, filename, and GitHub issue URL helpers.

## Hard Rules

- No backend by default.
- No accounts or login.
- No telemetry, analytics, or third-party error monitoring.
- No clinical interpretation, diagnosis, severity labels, or score color coding.
- No third-party push notification services.
- Do not commit real VEINES-QOL/Sym item text, validated translations, or normative constants unless `INSTRUMENT-LICENSE.md` records written permission.

## Verification

Use:

```bash
npm run verify
```

This runs type checks, contrast validation, translation validation, Vitest,
production build, Lighthouse accessibility, telemetry audit, and dependency
audit.

## Important Docs

- `README.md`: public entrypoint.
- `INSTRUMENT-LICENSE.md`: legal gate and provenance.
- `docs/DEPLOY.md`: deployment instructions.
- `docs/ARCHITECTURE.md`: runtime architecture.
- `docs/DEVICE-VERIFICATION.md`: automated smoke, Lighthouse, and Device Lab workflow.
- `.planning/REQUIREMENTS.md`: requirement status.
- `.planning/codebase/`: brownfield map.

## Current Known Gaps

- LSHTM written response is pending.
- Real-device iOS/Android/native print/screen-reader reports are still open and should use `#/device`.
- v0.1.0 should not be tagged until legal and physical-device gates are acceptable.
