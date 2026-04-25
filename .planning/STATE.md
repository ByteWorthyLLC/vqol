# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-25)

**Core value:** Patient-owned VEINES-QOL/Sym tracker as a static, forkable PWA — free outcomes data for practices without SaaS fees. The repo is the product.
**Current focus:** Phase 1 — Vertical Slice (Survey + Scoring + Storage)

## Current Position

Phase: 1 of 5 (Phase 0 async legal gate running in parallel)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-04-25 — Roadmap created; ROADMAP.md + STATE.md written; REQUIREMENTS.md traceability updated

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:** Not started

*Updated after each plan completion*

## Accumulated Context

### Decisions

See PROJECT.md Key Decisions table for full log.

Recent decisions affecting current work:
- Stack: Svelte 5 (not Preact) — paraglide CLI integration + smaller bundle; supersedes PROJECT.md "Preact" constraint
- PDF: `window.print()` + CSS `@media print` (not jsPDF) — jsPDF is 230KB gzip, exceeds app-shell budget
- IndexedDB wrapper: `idb` (not Dexie) — 3 simple CRUD stores; Dexie's query power is never exercised; 23KB delta not justified
- Routing: `wouter-preact` with `useHashLocation` — hash routing required for GitHub Pages zero-config static deploy
- Framework note: Architecture.md references "Preact" throughout; all module boundaries, signal-ownership rules, and data flow translate directly to Svelte 5 runes

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 0: LSHTM instrument licensing status is UNKNOWN. Phase 1 development proceeds with placeholder item text. Phase 0 gate must resolve before any public commit that includes verbatim VEINES-QOL/Sym question text. See PITFALLS.md A-1 for DMCA runbook.
- Phase 2: paraglide bare-Vite (non-SvelteKit) init path needs verification during Phase 2 dependency setup — not blocking Phase 1.

## Session Continuity

Last session: 2026-04-25
Stopped at: Roadmap written; ready to plan Phase 1
Resume file: None
