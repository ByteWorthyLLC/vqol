# vqol

## What This Is

vqol is a patient-owned VEINES-QOL/Sym tracker delivered as a static, installable PWA. Patients can complete a quality-of-life survey, keep longitudinal scores on their own device, view score trends, and export a clinician-ready report. Vein practices can fork the repo, edit `public/practice.json`, and deploy a branded copy without running a backend.

The repo target is `github.com/ByteWorthyLLC/vqol`. The application code is MIT licensed. Instrument content is separately governed by `INSTRUMENT-LICENSE.md`.

## Core Value

Give vein and vascular practices a free, forkable, local-first patient outcomes tool that can produce a credible outcomes story without SaaS fees, accounts, telemetry, or per-response platform costs.

## Current State

Phases 0-3 are complete in the working codebase:

- Legal/provenance package drafted.
- Survey, scoring-engine shape, and local storage built.
- Practice branding and four-locale message system built.
- Chart, print/PDF export, reminders, and PWA shell built.

Phase 4-7 launch surfaces are implemented: repo hygiene, CI/CD, Pages demo,
curiosity tools, Launch Kit, Device Lab, release copy, and evidence docs are in
place. The remaining launch work is legal response, trusted real-device reports,
and release tagging.

The Phase 4 strategy is curiosity-led. The project should spread because it is technically strange and inspectable: patient outcomes from static files, local-only browser storage, no account system, no telemetry, one-file practice forks, and an explicit legal-safe instrument mode.

## Active Requirements

### Product

- [x] Patient can take the local survey flow on mobile or desktop.
- [x] Draft answers persist in IndexedDB and can be resumed.
- [x] Scores persist locally and appear in history.
- [x] Results show QOL and Sym scores, deltas, and trend chart.
- [x] Patient can export a clinician report through the browser print dialog.
- [x] App supports en/es/fr/de message files with key validation.
- [x] Practice branding is configured through `public/practice.json`.
- [x] PWA manifest and service worker build successfully.
- [x] Device Lab collects runtime/manual verification evidence.
- [ ] Real VEINES-QOL/Sym item text and normative constants are legally cleared or replaced by reference-only mode.
- [ ] First production deployment is live at the operator practice.

### Repo and Launch

- [x] MIT license exists for application code.
- [x] README, support, security, governance, changelog, public roadmap, and deployment docs exist.
- [x] GitHub Actions CI and Pages deploy workflows exist.
- [x] Issue templates and pull request template exist.
- [x] `byteworthy.config.yaml` exists.
- [x] GitHub remote is configured and repository is public.
- [x] GitHub Pages demo is live.
- [x] Demo screenshots or GIF exist.
- [x] Seeded demo mode, local-first proof panel, one-file fork proof, offline challenge, Device Lab, and reference-only instrument mode exist as curiosity artifacts.
- [x] Public copy leads with implementation constraints and proofs rather than promotion.
- [x] Device-verification issue template exists for real-device evidence.
- [ ] v0.1.0 release is tagged after verification.

## Out of Scope

- Hosted multi-tenant SaaS.
- Account system or login.
- EHR integration.
- Diagnosis, clinical advice, severity labels, or score color coding.
- Telemetry, analytics, or third-party error monitoring.
- Third-party push notification services.
- Practice dashboard in v1.

## Context

- vqol is the first tool in the vein and vascular cluster.
- The operator context is a real vein/vascular practice.
- The cluster shares a fork-and-brand pattern: one practice config, static hosting, patient utility first.
- The app must remain small enough for a practice fork to understand and deploy.

## Constraints

- Static PWA only.
- No backend by default.
- No secrets required to deploy.
- Local-only patient data by default.
- Accessibility matters because the patient audience skews older.
- Instrument licensing is a hard launch gate.
- ByteWorthy public releases should use signed commits and tags.

## Key Decisions

| Decision | Rationale | Status |
|---|---|---|
| Static PWA over backend SaaS | Keeps fork-and-deploy simple and privacy-preserving | Accepted |
| Svelte 5 over Preact | Actual implemented stack; small runtime and simple state | Accepted |
| Hand-rolled hash router | Three routes do not justify a router dependency | Accepted |
| IndexedDB via `idb` | Thin typed wrapper, enough for sessions/scores/meta | Accepted |
| uPlot for charting | Small and lazy-loadable | Accepted |
| `window.print()` over jsPDF | Avoids large PDF dependency | Accepted |
| `practice.json` over admin UI | Single-file fork workflow | Accepted |
| Placeholder instrument content until permission | Avoids distributing unlicensed item text/constants | Accepted |
| Device Lab over unverifiable claims | Turns physical hard gates into repeatable JSON reports and public issues | Accepted |

---

Last updated: 2026-04-27 after Device Lab evidence amplification.
