# Project State

## Project Reference

See `.planning/PROJECT.md`.

**Core value:** Patient-owned VEINES-QOL/Sym tracking as a static, forkable PWA for vein and vascular practices.

**Current focus:** Phase 4 public deploy plus Phase 5 aggregate hardening.

## Current Position

Phase: 4/5 overlap
Status: Public repo and Pages demo live; final launch assets/checks pending
Last activity: 2026-04-26 - Added demo mode, curiosity lab, proof panel, fork audit, QR poster, calendar export, explicit instrument modes, aggregate submission, receiver example, dependency audit cleanup, planning normalization, public GitHub repo, and GitHub Pages deploy.

Progress: [████████░░] 80%

## Completed Phases

| Phase | Status | Evidence |
|---|---|---|
| 0. Legal Gate | Deliverables complete, async send pending | `.planning/phases/00-legal-gate/` |
| 1. Vertical Slice | Complete | `.planning/phases/01-vertical-slice/` |
| 2. White-label + i18n | Complete | `.planning/phases/02-white-label-i18n/` |
| 3. Patient/Clinician Value | Complete | `.planning/phases/03-patient-clinician-value/` |

## Active Phase

Phase 4 success means the repo is safe and understandable enough to make public:

- Public README and repo hygiene files exist.
- CI verifies the current build.
- GitHub Pages deploy workflow exists.
- Instrument licensing status is explicit.
- Real-device launch checklist is documented.
- The app avoids telemetry, accounts, backend dependencies, and clinical interpretation.
- The viral strategy leads with intellectual curiosity over promotion.
- The local demo proves weird constraints: static files, local storage, no backend by default, no analytics, one-file fork, fake data lab, offline readiness, and optional aggregate opt-in.

## Decisions

- Svelte 5 + Vite is the actual stack.
- Hand-rolled hash routing stays until route complexity grows.
- `idb` owns IndexedDB access through `src/lib/storage/`.
- uPlot is lazy-loaded only on the results route.
- PDF export uses `window.print()` plus print CSS, not jsPDF.
- `public/practice.json` is the practice-owned configuration file.
- Message files are hand-rolled JSON chunks, not Paraglide.
- VEINES-QOL/Sym item text and normative constants remain placeholders until LSHTM permission is resolved.
- Public launch copy must lead with constraints, proofs, implementation details, and failure modes. No "please star this" posture.
- `instrument.mode` keeps reference-only, permissioned VEINES, and bring-your-own-instrument deployments explicit.
- Aggregate submission is implemented but disabled by default and non-blocking.

## Open Blockers

- LSHTM licensing email has a draft, but the status log still shows it has not been sent.
- Public repository: `https://github.com/ByteWorthyLLC/vqol`.
- Live demo: `https://byteworthyllc.github.io/vqol/`.
- Demo route: `https://byteworthyllc.github.io/vqol/#/results?demo=1`.
- Discussions seeded:
  - `https://github.com/ByteWorthyLLC/vqol/discussions/1`
  - `https://github.com/ByteWorthyLLC/vqol/discussions/2`
  - `https://github.com/ByteWorthyLLC/vqol/discussions/3`
  - `https://github.com/ByteWorthyLLC/vqol/discussions/4`
  - `https://github.com/ByteWorthyLLC/vqol/discussions/5`
- Real-device PDF/PWA verification remains open.

## Pending Todos

- Send LSHTM inquiry email and update `INSTRUMENT-LICENSE.md`.
- Decide whether v0.1 ships full in-app survey or reference-only mode.
- Replace placeholder icons and add public demo screenshots or GIF.
- Generate deployed screenshots/GIF/social preview.
- Run iOS Safari, Android Chrome, desktop print, and screen-reader checks.
- Tag v0.1.0 only after the legal/public-demo gates are closed.

## Session Continuity

Resume from Phase 4. Start with `npm run verify`, then resolve the legal gate and public deployment path.
