# Architecture

vqol is a client-only Svelte 5 app built with Vite. It uses hash routing so it can run on GitHub Pages without a server-side fallback.

## Runtime Flow

```text
index.html
  -> src/main.ts
  -> src/App.svelte
      -> load public/practice.json
      -> validate config
      -> apply CSS variables
      -> load locale messages
      -> render route from hash
```

Routes:

- `#/` renders `Home.svelte`.
- `#/survey` renders `Survey.svelte`.
- `#/results` renders `Results.svelte`.

## Core Modules

- `src/lib/practice-config/`: validates `practice.json` and applies branding.
- `src/lib/i18n/`: lazy-loads JSON messages and provides `t(key, params)`.
- `src/lib/storage/`: opens IndexedDB and owns all local persistence.
- `src/lib/scoring/`: defines item metadata, constants, and pure scoring functions.
- `src/lib/survey/`: maps scoring item metadata to survey prompt and answer-scale keys.
- `src/lib/chart/`: lazy-loads uPlot on the results route.
- `src/lib/pdf/`: snapshots the chart canvas and calls `window.print()`.
- `src/lib/notifications/`: computes follow-up reminders and notification caps.

## Data Model

IndexedDB database: `vqol-data`.

Stores:

- `sessions`: draft, completed, and discarded survey sessions.
- `scores`: calculated QOL and Sym T-scores.
- `meta`: locale/install/reminder metadata.

No patient data leaves the device in the default app.

## Privacy Boundary

Network access is limited to static assets and `practice.json`. There is no default API endpoint, account system, analytics provider, or error-monitoring SDK.

Aggregate submission is planned for a later phase and must stay opt-in.

## Instrument Boundary

Application code is MIT licensed. VEINES-QOL/Sym item text, validated translations, and normative constants are instrument content and remain gated by `INSTRUMENT-LICENSE.md`.
