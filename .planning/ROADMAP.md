# Roadmap: vqol

## Overview

vqol is already through the product-build phases. The remaining work is launch readiness through intellectual curiosity: legal gate, public repo hygiene, demo deployment, inspectable proof artifacts, manual device verification, and then optional aggregate submission plus cluster extraction.

## Phase Status

| Phase | Name | Status | Evidence |
|---|---|---|---|
| 0 | Legal Gate | Deliverables complete, async send pending | `.planning/phases/00-legal-gate/` |
| 1 | Vertical Slice | Complete | `.planning/phases/01-vertical-slice/` |
| 2 | White-label + i18n | Complete | `.planning/phases/02-white-label-i18n/` |
| 3 | Patient/Clinician Value | Complete | `.planning/phases/03-patient-clinician-value/` |
| 4 | Curiosity-Led Virality + GH Pages Deploy | Active | Public repo, Pages demo, launch copy, screenshots/GIF, and discussions live; physical/legal gates pending |
| 5 | Aggregate Submit + Cluster Extraction | Started | Optional aggregate path and receiver example implemented |
| 6 | Creative Application Amplification Studio | Complete | Outcomes Studio and Practice Forge implemented and deployed |
| 7 | Viral Functionality and Marketing Loop | Complete | Launch Kit and SW update prompt implemented and deployed |

## Phase 0: Legal Gate

Goal: secure written permission for VEINES-QOL/Sym item text and normative constants, or ship reference-only mode.

Done:

- `INSTRUMENT-LICENSE.md`
- LSHTM inquiry draft
- cite pack
- fallback plan

Open:

- Send inquiry.
- Record response.
- Decide full instrument mode or reference-only mode before public release.

## Phase 1: Vertical Slice

Goal: patient can complete the survey flow, receive a score, and persist the result locally.

Done:

- Scoring-engine shape.
- Item metadata.
- IndexedDB session and score stores.
- Survey route with one question per screen.
- Draft resume flow.
- Results screen with score and delta.

Known limitation:

- Real normative constants and item text are placeholders pending legal permission.

## Phase 2: White-label + i18n

Goal: practice can brand the app through `practice.json`, and UI strings are available in four locales.

Done:

- Practice config validation.
- Branding through CSS custom properties.
- Contrast validation script.
- Locale loading.
- Translation key validation.
- `en`, `es`, `fr`, `de` message files.

Known limitation:

- Validated medical translations still depend on instrument permission.

## Phase 3: Patient/Clinician Value

Goal: patient can view history, export a report, install the app, and receive follow-up reminders.

Done:

- uPlot trend chart.
- Accessible chart table fallback.
- Print/PDF export flow.
- Reminder scheduler and cap logic.
- In-app reminder banner.
- PWA manifest and service worker.
- Install prompt.

Open manual checks:

- iOS Safari PDF export.
- Android Chrome PWA install and notification behavior.
- Desktop Chrome/Firefox print output.
- VoiceOver/NVDA survey and results navigation.

## Phase 4: Curiosity-Led Virality + GH Pages Deploy

Goal: make the repo public-ready and demo-ready in a way that spreads because it is technically interesting, not because it is promoted aggressively.

Success criteria:

1. Root README explains the product, current legal status, setup, verification, and privacy model.
2. License, changelog, public roadmap, support, security, governance, contributing, and fork registry exist.
3. GitHub issue templates, pull request template, CI, and Pages deploy workflows exist.
4. `npm run verify` is the local and CI gate.
5. GitHub Pages demo is live and mobile-usable.
6. Seeded demo mode, local-first proof panel, one-file fork proof, and offline challenge exist.
7. Reference-only/licensed-instrument mode is explicit before public release.
8. Public release copy avoids clinical claims about vqol itself and leads with constraints/proofs over promotion.
9. Channel drafts are written only after the working artifacts exist.

Current status:

- Repo docs and workflow scaffolding are now in place.
- Amplification research and Phase 4 curiosity plan are now in place.
- Curiosity artifacts are implemented in app routes.
- Public repo is live at `https://github.com/ByteWorthyLLC/vqol`.
- GitHub Pages demo is live at `https://byteworthyllc.github.io/vqol/`.
- Deployed screenshots/GIF are generated under `docs/assets/`.
- Launch copy is reviewed in `docs/LAUNCH-COPY.md`.
- Lighthouse accessibility now runs in `npm run verify`.

## Phase 5: Aggregate Submit + Cluster Extraction

Goal: add optional practice-owned aggregate submission and document reusable modules for the vein cluster.

Success criteria:

1. `aggregateSubmit: true` posts a de-identified payload only to an HTTPS practice endpoint. **Done.**
2. `http://` aggregate endpoints are rejected.
3. Cloudflare Worker receiver example exists. **Done.**
4. Shared module docs exist for practice config, i18n, PDF export, and aggregate submission.
5. First operator deployment is listed in `FORKS.md`.

## Execution Order

Phase 4 must close before Phase 5 starts. Legal gate resolution can happen at any point, but public release cannot proceed without either written permission or reference-only mode.

## Phase 6: Creative Application Amplification Studio

Goal: make the project feel like a real creative application by adding useful,
safe, fake-data operator tooling.

Done:

- Outcomes Studio at `#/studio`.
- Practice Forge at `#/forge`.
- Fake cohort simulation, protocol comparison, CSV export, and protocol brief.
- Live `practice.json` builder with validation and fork-readiness scoring.

Open:

- Consider social share-card generation as a later phase.

### Phase 7: Viral functionality and marketing loop

**Goal:** turn working application surfaces into useful viral mechanics.
**Requirements**: VIRL-01 through VIRL-08
**Depends on:** Phase 6
**Plans:** 1 plan

Plans:
- [x] Launch Kit route and launch/remix artifact generator.
- [x] Viral playbook and weird experiment issue template.
- [x] Verify and deploy Phase 7 route.
