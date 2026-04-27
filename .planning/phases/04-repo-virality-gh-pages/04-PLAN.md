# Phase 4 Plan: Curiosity-Led Viral Project

## Success Criteria

1. A technically curious visitor can understand the weird constraint in under 10 seconds: clinical outcomes, static files, no backend, patient-owned data.
2. The live demo shows useful fake score history immediately without writing fake data into real patient storage.
3. The app visibly proves the local-first claim through UI, docs, and telemetry audit.
4. The one-file fork workflow is visible and inspectable, not just described.
5. The legal/instrument mode is explicit and architecturally interesting: full mode only after permission, otherwise reference-only/bring-your-own-instrument mode.
6. Share assets are generated from working artifacts, not mockups.
7. Channel drafts exist only after the artifacts they discuss are real.
8. `npm run verify` remains green.

## Wave 1: Weird Constraint Demo

- [x] Add seeded demo mode with fake patient history and a visible demo-data banner.
- [x] Ensure demo mode never writes fake data into real patient history.
- [x] Add a short "why this is weird" panel: static PWA, no account, no backend by default, no analytics.

## Wave 2: Trust and Proof

- [x] Add local-first proof panel linked from README/demo.
- [x] Document offline challenge in README and release checklist.
- [x] Add a visible link to telemetry audit and privacy architecture.
- [x] Add reference-only/licensed-instrument mode explanation as a product surface.

## Wave 3: Forkability Artifacts

- [x] Build one-file fork wizard or docs page around `public/practice.json`.
- [x] Add printable waiting-room QR poster generator or print template.
- [x] Add calendar follow-up export (`.ics`) after baseline as a low-risk reminder fallback.

## Wave 4: Curiosity Assets

- [x] Create launch GIF.
- [x] Create social preview image.
- [x] Serve app-link social preview image from deployed static assets.
- [x] Add live screenshots/GIF using fake data.
- [ ] Create comparison image: "Closed PRO SaaS vs static local-first fork."

## Wave 5: Channel Packet

- Draft Show HN title and first comment around the implementation constraint, not a product pitch.
- Draft Reddit moderator outreach for r/varicoseveins, r/vascular, r/lymphedema.
- Draft LinkedIn carousel outline around the operator problem and local-first pattern.
- Seed GitHub Discussions:
  - Welcome / what this is
  - How the local-first architecture works
  - Why reference-only instrument mode exists
  - Share your practice fork
  - Request a translation
  - Instrument licensing FAQ

## Wave 6: Legal and Release Gate

- Send LSHTM inquiry and update `INSTRUMENT-LICENSE.md`.
- If permission is unresolved, implement reference-only/bring-your-own-instrument mode before public launch.
- Run real-device iOS/Android/Desktop verification through `#/device`.
- Enable GitHub Pages and tag v0.1.0 only after legal/demo gates pass.

## Anti-Goals

- No patient gamification.
- No public leaderboards.
- No severity color scales.
- No diagnosis/clinical advice copy.
- No analytics.
- No unlicensed instrument content.

## Copy Standard

Public copy must lead with constraints, proofs, and implementation details. Avoid "revolutionary," "disrupt," "please star," or any language that sounds like launch marketing.
