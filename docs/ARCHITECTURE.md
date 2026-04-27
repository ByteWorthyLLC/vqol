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
- `#/lab` renders the fake-data and proof tool index.
- `#/studio` renders the synthetic outcomes workbench.
- `#/forge` renders the local `practice.json` builder.
- `#/launch` renders the viral functionality and marketing artifact generator.
- `#/device` renders the runtime and physical-device evidence lab.
- `#/proof`, `#/fork`, and `#/poster` render proof, fork-audit, and QR poster tools.

## Core Modules

- `src/lib/practice-config/`: validates `practice.json` and applies branding.
- `src/lib/i18n/`: lazy-loads JSON messages and provides `t(key, params)`.
- `src/lib/storage/`: opens IndexedDB and owns all local persistence.
- `src/lib/scoring/`: defines item metadata, constants, and pure scoring functions.
- `src/lib/survey/`: maps scoring item metadata to survey prompt and answer-scale keys.
- `src/lib/chart/`: lazy-loads uPlot on the results route.
- `src/lib/demo/`: creates deterministic fake score histories.
- `src/lib/studio/`: creates deterministic fake cohorts and protocol summaries.
- `src/lib/forge/`: creates and serializes local practice config drafts.
- `src/lib/device/`: formats runtime/manual device verification reports and issue URLs.
- `src/lib/fork/`: audits whether `practice.json` is fork-ready.
- `src/lib/marketing/`: generates Launch Kit links, copy, rubrics, and briefs.
- `src/lib/aggregate/`: optional de-identified aggregate submit path, disabled by default.
- `src/lib/pdf/`: snapshots the chart canvas and calls `window.print()`.
- `src/lib/notifications/`: computes follow-up reminders and notification caps.
- `src/routes/SwUpdatePrompt.svelte`: renders the service-worker refresh prompt and
  disables reload while a survey is active.

## Data Model

IndexedDB database: `vqol-data`.

Stores:

- `sessions`: draft, completed, and discarded survey sessions.
- `scores`: calculated QOL and Sym T-scores.
- `meta`: locale/install/reminder metadata.

No patient data leaves the device in the default app.
The Device Lab writes only a metadata probe to verify IndexedDB availability.
Its JSON report is downloaded or submitted by the tester.

## Privacy Boundary

Network access is limited to static assets and `practice.json`. There is no default API endpoint, account system, analytics provider, or error-monitoring SDK.

Aggregate submission exists but stays opt-in and requires an HTTPS practice endpoint.

## Instrument Boundary

Application code is MIT licensed. VEINES-QOL/Sym item text, validated translations, and normative constants are instrument content and remain gated by `INSTRUMENT-LICENSE.md`.
