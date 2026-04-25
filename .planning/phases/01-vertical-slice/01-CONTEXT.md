# Phase 1: Vertical Slice — Survey + Scoring + Storage - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous)

<domain>
## Phase Boundary

A patient can complete the full VEINES-QOL/Sym survey (25 scored items + Q2 descriptive) in one sitting on mobile or desktop, receive validated VEINES-QOL and VEINES-Sym T-scores, and have those scores persist to IndexedDB so a second session shows the prior result.

NO branding, NO i18n, NO chart, NO PDF, NO reminders, NO PWA in this phase. English-only hardcoded strings. Item text uses validated content if LSHTM permission lands by P1 close, otherwise placeholder text per `INSTRUMENT-LICENSE.md` fallback.

The success metric: `npm run dev` → fill out 25-item survey on iPhone Safari → see "Your VEINES-QOL T-score: 47, VEINES-Sym T-score: 52" → close tab → reopen → "Resume survey?" / "View prior score?" works.
</domain>

<decisions>
## Implementation Decisions

### Scaffolding
- Tool: `npm create vite@latest . -- --template svelte-ts`
- Package manager: `npm` (matches user's existing project pattern; no pnpm-specific tooling needed)
- TS strict mode on; `tsc --noEmit` passes
- Vitest for unit tests; `fake-indexeddb/auto` for storage tests

### Module structure
```
src/
├── app.html              (Vite root)
├── main.ts               (mount Svelte App.svelte)
├── App.svelte            (router + page slots)
├── lib/
│   ├── scoring/
│   │   ├── algorithm.ts        (pure scoring engine — no I/O)
│   │   ├── algorithm.test.ts   (Vitest unit tests against published examples)
│   │   ├── constants.ts        (item-level normative means/SDs — placeholder until Scoring Manual confirmed)
│   │   └── types.ts            (Answer, Score, ItemId, etc.)
│   ├── storage/
│   │   ├── db.ts               (idb singleton, 3 object stores: sessions, scores, meta)
│   │   ├── db.test.ts          (CRUD tests using fake-indexeddb)
│   │   └── types.ts            (Session, ScoreRecord, MetaKey)
│   └── survey/
│       ├── items.ts            (VEINES-QOL/Sym item definitions — text + answer scale)
│       └── flow.ts             (one-question-per-screen sequencing)
└── routes/
    ├── Home.svelte             (CTA: start / resume / view prior)
    ├── Survey.svelte           (single-question-at-a-time UI; locale-locked)
    └── Results.svelte          (just the score number; NO interpretation copy)
```

### Survey behavior
- One question per screen
- Each answer writes to IndexedDB on selection (draft-save) — solves B-1 + E-2
- A "Resume survey" CTA appears on Home if a draft session exists
- Locale lock: even though we have only EN in P1, a `lockedLocale` field is set on session start (groundwork for P2)
- Submit button uses `100svh` and fixed bottom bar (B-3)
- Time-per-question tracked locally; total < 45s flags reconfirmation prompt

### Scoring algorithm
- VEINES-QOL: 25 items (Q1 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8) — Q3, Q6, Q7 reverse-scored
- VEINES-Sym: 10 items (Q1 + Q7) — same reverse-scoring
- T-score formula: per-item z-score normalization → average → ×10 + 50
- Q2 (time of day) is descriptive only, not scored
- ≤ 20% missing items required for scoring; below threshold returns `{ status: 'incomplete', missing: [...] }`
- Scoring constants ship with placeholder values clearly labeled `// PLACEHOLDER until Scoring Manual confirmed` — Phase 4 verification re-checks before v0.1.0 tag
- Exposed as a pure function: `score(answers: Answer[]): VeinesScoreResult`

### Storage
- `idb` v8+ singleton DB named `vqol-data`
- Three object stores:
  - `sessions` — keyPath `id`; stores draft + completed sessions with `{id, startedAt, completedAt?, lockedLocale, answers: Map<ItemId, AnswerValue>, status}`
  - `scores` — keyPath `id`; stores `{id, sessionId, qolTscore, symTscore, calculatedAt}`
  - `meta` — keyPath `key`; for app-level state (install state, notification cap counters in P3)
- Singleton pattern — only `lib/storage/db.ts` opens IndexedDB
- `fake-indexeddb/auto` imported in `vitest.config.ts` setup file

### Item text strategy (Phase 1 intermediate)
- Ship with **placeholder English text** for all 25 items — clearly labeled in source comments
- Real item text loads from a JSON file (`src/lib/survey/items-en.json`) that can be replaced post-LSHTM-confirmation without code changes
- Phase 1 unblocks development; Phase 4 verification gates v0.1.0 on real-text status

### Anti-features enforced
- No analytics, no telemetry, no third-party fonts, no Google Analytics — `package.json` reviewed
- Results.svelte renders ONLY: score, prior score, "Higher = better" — no severity, no color coding, no interpretation copy

### Out of scope for Phase 1
- Trend chart (P3)
- PDF export (P3)
- Reminders (P3)
- PWA / service worker (P3)
- Branding (P2)
- i18n / paraglide (P2)
- Aggregate submit (P5)

### Claude's Discretion
All implementation choices for module organization, naming, and TypeScript types within the scope above are at Claude's discretion. Code should be clean, simple, and ready to extend in P2.

</decisions>

<code_context>
## Existing Code Insights

This is a greenfield repo. No existing code yet.

### Established patterns from research (SUMMARY.md, ARCHITECTURE.md)
- Pure functions for scoring (testable in isolation)
- Singleton DB pattern (only storage module opens IDB)
- Signal-based state for UI (Svelte 5 runes)
- Hash routing (svelte-spa-router) — needed for GitHub Pages later

### Reusable from cluster
- The `lib/storage/` pattern will be copied (not extracted) to postsclera in its first phase
- The `lib/scoring/` pattern is vqol-specific (other cluster tools have different calculations)

</code_context>

<specifics>
## Specific Ideas

- Vitest tests must verify scoring engine against the worked examples in Lamping 2003 + Kahn 2006 — these are the highest-value tests in the project
- A failing test with the published example inputs IS the scoring acceptance gate
- Even with placeholder constants, the **algorithm shape** (z-score → average → T-score transform) must be correct so that swapping in real constants doesn't require code changes

</specifics>

<deferred>
## Deferred Ideas

- Survey item randomization for response-bias mitigation (E-1 partial mitigation already covered by one-per-screen + time tracking; randomization is v2)
- Save/resume across multiple drafts (P1 supports one active draft at a time; multiple drafts is v2)
- Session expiry on partial drafts (e.g., auto-discard after 7 days) — v2

</deferred>
