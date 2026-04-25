# Phase 1: Vertical Slice — Summary

**Status:** Complete
**Completed:** 2026-04-25

## What Shipped

### Project scaffolding
- `package.json` — Vite 6 + Svelte 5 + TypeScript 5.7 + Vitest 2 + idb 8 + fake-indexeddb 6
- `tsconfig.json` — strict mode, no-unused checks, verbatim module syntax, ES2022 target
- `vite.config.ts` + `svelte.config.js` + `vitest.setup.ts`
- `index.html` with viewport-fit=cover for iOS notch + safe-area
- `.gitignore`

### Scoring engine (`src/lib/scoring/`)
- `types.ts` — ItemId, Subscale, ItemDefinition, Answers, NormativeConstants, ScoringResult
- `constants.ts` — 25 QOL items + 10 Sym items per Lamping 2003 structure (Q1.1-9, Q3, Q4.1-11, Q5, Q6, Q7, Q8); Q3/Q6/Q7 reverse-scored; PLACEHOLDER normative means/SDs
- `algorithm.ts` — pure-TS T-score: per-item z-score → average → ×10+50; reverse-scoring; ≥80% threshold; rounded to 1 decimal
- `algorithm.test.ts` — 8 passing tests: item counts, T=50 at norm mean, max>min, reverse-scoring, threshold boundary, rounding

### Storage layer (`src/lib/storage/`)
- `types.ts` — SessionRecord, ScoreRecord, MetaRecord, Locale
- `db.ts` — `idb` singleton (`vqol-data` v1) with 3 stores (sessions/scores/meta); CRUD + indexes (by-status, by-session, by-calculated); `wipeAll()` for the future "wipe everything" feature
- `db.test.ts` — 7 passing tests via `fake-indexeddb/auto`: draft create+resume, answer recording, draft→completed transition, score persistence, meta CRUD, wipe

### Survey UI (`src/`)
- `App.svelte` — minimal hash router (no svelte-spa-router yet — adding when needed P2+); footer with repo link
- `routes/Home.svelte` — resume-or-start CTA + prior-result card (loads from IndexedDB on mount)
- `routes/Survey.svelte` — one-question-per-screen, draft-save on every selection, jumps to first unanswered on resume, fixed `.bottom-bar` with `100svh` body so iOS keyboard never hides Submit
- `routes/Results.svelte` — score + delta + "Higher = better" only; NO severity, NO color coding, NO interpretation copy (FDA SaMD exclusion)
- `lib/survey/items.ts` — placeholder English prompts mapped from item definitions; option labels FREQ_6 / CHANGE_5 / LIMIT_5 derived from scaleRange
- `app.css` — base styles, dark-mode via `prefers-color-scheme`, 44×44px tap targets, `100svh`, safe-area-inset

## Requirements Satisfied

| REQ-ID | Status |
|---|---|
| SURV-01 (full questionnaire on mobile/desktop) | ✓ |
| SURV-02 (one-per-screen) | ✓ |
| SURV-03 (draft-save on selection) | ✓ |
| SURV-04 (Resume CTA on Home) | ✓ |
| SURV-05 (locale-locked at session start) | ✓ |
| SURV-06 (`100svh`, fixed bottom bar) | ✓ |
| SURV-07 (≥80% items required to score) | ✓ |
| SURV-08 (dwell-time tracking) | ✓ recorded; reconfirm UI deferred to P2 |
| SCOR-01 (VEINES-QOL T-score) | ✓ shape |
| SCOR-02 (VEINES-Sym T-score) | ✓ shape |
| SCOR-03 (Q3/Q6/Q7 reverse-scored) | ✓ |
| SCOR-04 (constants in `scoring/constants.ts`) | ✓ PLACEHOLDER pending Scoring Manual |
| SCOR-05 (engine has no I/O) | ✓ |
| SCOR-06 (Vitest tests against algorithm shape) | ✓ 8 tests |
| STOR-01 (idb v8+) | ✓ |
| STOR-02 (singleton DB) | ✓ |
| STOR-03 (3 object stores) | ✓ |
| STOR-04 (zero network — patient data) | ✓ inspection |
| STOR-05 (fake-indexeddb in setup) | ✓ |

## Bundle Math (actual)

| Asset | Raw | Gzip |
|---|---|---|
| index.html | 0.62 KB | 0.37 KB |
| index-*.css | 4.57 KB | 1.47 KB |
| index-*.js | 52.11 KB | **19.69 KB** |
| **Total shell** | 57.30 KB | **21.53 KB** |

Research target was 58–73 KB gzip. Actual shell at 21.5 KB — **far under budget**, leaves headroom for paraglide (P2), uPlot lazy-load (P3), service worker (P3).

## Quality Gates

- ✓ Vitest: 15/15 passing
- ✓ svelte-check: 0 errors, 0 warnings
- ✓ vite build: succeeds, sourcemaps enabled
- ✓ No telemetry / analytics in `package.json` deps

## Notes for Phase 2

- `App.svelte` uses a tiny hand-rolled hash router. Replace with `wouter-preact`-equivalent for Svelte? Or keep hand-rolled (current is ~30 lines and explicit). Decision: keep hand-rolled until routing complexity grows past 4 routes.
- `lib/survey/items.ts` has placeholder English prompts inline. Phase 2 will move these to `messages/en.json` (paraglide) and add `es/fr/de`.
- `practice.json` not yet read — it's a Phase 2 deliverable.
- Brand color CSS custom properties are hardcoded in `app.css` — Phase 2 will read from `practice.json` and apply at boot.

## Open Async Items

- LSHTM Scoring Manual response → replaces PLACEHOLDER constants in `src/lib/scoring/constants.ts`
- Real instrument prompts → replaces placeholder text in `src/lib/survey/items.ts` once permission lands
