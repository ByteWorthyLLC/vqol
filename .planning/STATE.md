# Project State

## Project Reference

See `.planning/PROJECT.md`.

**Core value:** Patient-owned VEINES-QOL/Sym tracking as a static, forkable PWA for vein and vascular practices.

**Current focus:** Phase 7 viral functionality and marketing loop.

## Current Position

Phase: 7
Status: Launch Kit implemented locally; verification/deploy pending
Last activity: 2026-04-27 - Added a functional viral marketing workbench that generates share artifacts, AI citation text, clinical pilot outreach, contributor prompts, and remix links from real app routes.

Progress: [█████████░] 90%

## Completed Phases

| Phase | Status | Evidence |
|---|---|---|
| 0. Legal Gate | Deliverables complete, async send pending | `.planning/phases/00-legal-gate/` |
| 1. Vertical Slice | Complete | `.planning/phases/01-vertical-slice/` |
| 2. White-label + i18n | Complete | `.planning/phases/02-white-label-i18n/` |
| 3. Patient/Clinician Value | Complete | `.planning/phases/03-patient-clinician-value/` |
| 4. Repo Virality + GH Pages | Complete, launch assets pending | `.planning/phases/04-repo-virality-gh-pages/` |
| 5. Aggregate Submit + Cluster Extraction | Complete, operator listing pending | `.planning/phases/05-aggregate-submit-cluster-extraction/` |
| 6. Creative Application Amplification Studio | Complete | `.planning/phases/06-creative-application-amplification-studio/` |

## Active Phase

Phase 7 success means attention converts into functional use:

- Generated artifacts are based on live app routes.
- Public copy leads with inspectable constraints and proof.
- Developers get a contributor challenge instead of a vague feature ask.
- Practices get a forge/poster pilot path.
- Clinicians get a fake-data review path before patient use.
- AI citation text is short, extractable, and claim-bounded.

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
- Phase 6 turns the demo into an operator tool: synthetic outcomes planning and local config forging.
- Phase 7 treats marketing as product functionality: share copy and launch briefs must be generated from working demo/proof/studio/forge/poster routes.

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
- Verify and deploy Phase 7 Launch Kit route.

## Session Continuity

Resume from Phase 7. Start with `npm run verify`, browser-smoke `#/launch`, then push and verify GitHub Pages deployment.

## Accumulated Context

### Roadmap Evolution

- Phase 6 added: Creative application amplification studio.
- Phase 7 added: Viral functionality and marketing loop with Launch Kit, AI citation block, remix links, and weird experiment issue template.
