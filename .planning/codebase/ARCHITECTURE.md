# Architecture

vqol is a client-only SPA with hash routing.

## Boot Flow

1. `src/main.ts` mounts `App.svelte`.
2. `App.svelte` fetches `./practice.json`.
3. Practice config is validated by `src/lib/practice-config/validate.ts`.
4. Branding is applied to CSS custom properties.
5. Locale messages are loaded through `src/lib/i18n/loader.ts`.
6. Route is selected from `window.location.hash`.

## Route Boundaries

- `Home.svelte`: reads draft/latest score, starts survey, opens results.
- `Survey.svelte`: owns survey session lifecycle and answer persistence.
- `Results.svelte`: reads score history, renders chart/report/export controls.
- `Lab.svelte`: indexes fake-data, proof, launch, fork, poster, forge, studio, and device tools.
- `DeviceLab.svelte`: collects runtime checks and manual physical-device evidence without patient data.

## Domain Boundaries

- `scoring/`: pure functions and constants, no storage or UI.
- `storage/`: all IndexedDB access.
- `practice-config/`: app boot config, validation, branding.
- `i18n/`: message loading and interpolation.
- `chart/`: results-only chart rendering.
- `pdf/`: print mode and chart snapshot injection.
- `notifications/`: scheduling logic and browser notification wrappers.
- `device/`: Device Lab report formatting, filenames, and GitHub issue URLs.

## Architectural Constraints

- Default app must stay backend-free.
- Patient data must stay local by default.
- Instrument content must stay license-gated.
- Clinical interpretation must not enter the UI.
