# Project Structure

## Root

- `README.md`: public project entrypoint.
- `INSTRUMENT-LICENSE.md`: VEINES-QOL/Sym provenance and licensing gate.
- `CHANGELOG.md`: release notes.
- `ROADMAP.md`: public phase-level roadmap.
- `byteworthy.config.yaml`: ByteWorthy product metadata.
- `package.json`: scripts and dependencies.

## App

- `src/App.svelte`: boot, config load, locale load, hash routing.
- `src/main.ts`: Svelte mount.
- `src/app.css`: global layout, controls, print CSS.
- `src/routes/`: route-level Svelte components.
- `src/lib/`: reusable domain modules.
  - `aggregate/`: optional de-identified aggregate submission.
  - `calendar/`: local follow-up `.ics` export.
  - `demo/`: deterministic fake score history.
  - `download/`: browser file download helper.
  - `forge/`: practice config builder helpers.
  - `fork/`: one-file fork readiness audit.
  - `marketing/`: Launch Kit URL, artifact, and brief generation.
  - `studio/`: synthetic cohort generation and protocol summaries.

## Data and Config

- `public/practice.json`: practice-owned configuration.
- `messages/*.json`: locale message files.
- `public/icons/`: PWA icons.

## Validation

- `scripts/validate-contrast.ts`: WCAG contrast gate for practice colors.
- `scripts/validate-translations.ts`: locale key and empty-string gate.
- `scripts/audit-telemetry.ts`: built-output telemetry signature audit.
- `scripts/check-lighthouse-accessibility.mjs`: route-level Lighthouse accessibility gate.
- `scripts/capture-launch-assets.mjs`: deployed screenshot and launch GIF generator.
- `scripts/device-smoke.mjs`: deployed desktop/mobile smoke check and PDF artifact generator.
- `vitest.setup.ts`: fake IndexedDB setup.

## GSD Planning

- `.planning/PROJECT.md`: project vision and scope.
- `.planning/REQUIREMENTS.md`: requirement inventory and traceability.
- `.planning/ROADMAP.md`: internal phase plan.
- `.planning/STATE.md`: current work state.
- `.planning/phases/`: phase summaries and verification.
- `.planning/codebase/`: brownfield codebase map.
