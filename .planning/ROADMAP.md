# Roadmap: vqol

## Overview

vqol ships as a vertical slice (survey → score → storage) in Phase 1, adds white-label and i18n in Phase 2 (because every Phase 3 feature needs localized strings), then delivers the patient/clinician value layer (chart, PDF, notifications, PWA hardening) in Phase 3. Phase 4 builds the distribution layer — repo virality, CI/CD, GitHub Pages demo — on top of a working product. Phase 5 closes with the aggregate submit feature and cluster-lib extraction that seeds postsclera/veinquest/stockingfit/veinmap. Phase 0 is an async legal gate (LSHTM instrument licensing) that runs in parallel with Phase 1 and never blocks development — only the verbatim item text is the legal risk surface.

---

## Phases

**Special:**
- [ ] **Phase 0: Legal Gate** — Async — Send LSHTM licensing inquiry; receive permission or execute fallback. Runs in parallel with Phase 1. INSTRUMENT-LICENSE.md committed regardless of outcome.

**Sequential (Days 1-23):**
- [ ] **Phase 1: Vertical Slice — Survey + Scoring + Storage** - Patient can complete VEINES-QOL/Sym, score is calculated, result persists in IndexedDB
- [ ] **Phase 2: White-label + i18n** - Fork edits `practice.json`; site renders with practice branding; all strings in EN/ES/FR/DE
- [ ] **Phase 3: Patient/Clinician Value** - Trend chart, PDF export, push reminders, PWA install prompt; full patient lifecycle works
- [ ] **Phase 4: Repo Virality + GH Pages Deploy** - Public repo, CI/CD, Lighthouse-verified demo, README hero, v0.1.0 release
- [ ] **Phase 5: Aggregate Submit + Cluster lib Extraction** - Opt-in aggregate feature live; cluster-shareable lib/ documented; operator validation at author's clinic

---

## Phase Details

### Phase 0: Legal Gate (PARALLEL WITH PHASE 1)
**Goal**: Secure written permission for OSS verbatim distribution of VEINES-QOL/Sym item text, or execute documented fallback — and commit INSTRUMENT-LICENSE.md either way
**Depends on**: Nothing (async, starts day 1)
**Requirements**: LEGL-01, LEGL-02, LEGL-03
**Success Criteria** (what must be TRUE):
  1. LSHTM licensing inquiry email has been sent (per `.planning/legal/lshtm-inquiry-email.md`) and delivery confirmed
  2. A written response is received granting permission OR the fallback strategy is executed and documented (per `.planning/legal/fallback-plan.md`)
  3. `INSTRUMENT-LICENSE.md` is committed to repo root crediting Lamping 2003, Kahn 2006, and LSHTM regardless of permission outcome
**Plans**: TBD
**Watch out for**: A-1 (instrument licensing ambiguity — the only true launch blocker; DMCA takedown collapses the entire distribution channel; placeholder item text in Phase 1 development keeps this gate non-blocking)

---

### Phase 1: Vertical Slice — Survey + Scoring + Storage
**Goal**: A patient can complete the full VEINES-QOL/Sym survey on mobile or desktop, receive a validated T-score, and have that score persist so a second session shows the prior result
**Depends on**: Nothing (first dev phase; Phase 0 runs concurrently)
**Requirements**: SURV-01, SURV-02, SURV-03, SURV-04, SURV-05, SURV-06, SURV-07, SURV-08, SCOR-01, SCOR-02, SCOR-03, SCOR-04, SCOR-05, SCOR-06, STOR-01, STOR-02, STOR-03, STOR-04, STOR-05
**Success Criteria** (what must be TRUE):
  1. A patient can complete all 25 scored VEINES-QOL items on iPhone Safari with the submit button visible above the keyboard throughout
  2. Scoring engine returns a VEINES-QOL T-score and VEINES-Sym T-score that match all published example inputs from Lamping 2003 + Kahn 2006 (verified by Vitest unit tests)
  3. Closing the browser tab mid-survey and reopening shows a "Resume survey" CTA with answers intact at the last answered question
  4. Completing a second survey shows the prior T-score on the results screen alongside the new score
  5. CI grep on `dist/` confirms zero network calls for patient data
**Plans**: TBD
**UI hint**: yes
**Watch out for**:
  - B-1 (SW `autoUpdate` kills mid-survey session → `registerType: 'prompt'` + IndexedDB draft-save on every answer selection)
  - E-2 (partial session becomes unscorable → `session_in_progress` record with `{questionIndex, answers[], startedAt}` written on every answer)
  - E-1 (ceiling effect from inattentive answering → one question per screen + time-per-question tracking + gentle 45s flag)
  - E-5 (locale switch mid-survey mixes instruments → lock locale at survey start, disable selector on `/#/survey` route)
  - B-3 (iOS keyboard covers submit button → `100svh` not `100vh`, submit in fixed bottom bar)
  - A-3, E-3 (score interpretation copy drifts into clinical advice → results screen shows only `{score, priorScore, delta}` — no severity mapping, no color coding, no interpretation text)
  - A-5 (patient liability for self-tracking without clinician loop → onboarding screen shows "Your scores are stored on this device. To include them in your care, tap 'Export PDF' and share with your provider at your next appointment.")

---

### Phase 2: White-label + i18n
**Goal**: A forking practice edits only `practice.json` and deploys a site that renders with their branding, name, and logo; all UI strings are available in EN, ES, FR, and DE with empty translations failing the build
**Depends on**: Phase 1
**Requirements**: BRND-01, BRND-02, BRND-03, BRND-04, BRND-05, BRND-06, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05
**Success Criteria** (what must be TRUE):
  1. A practice forks the repo, edits `practice.json` with their brand colors and logo URL, and the deployed site renders with their branding applied via CSS custom properties — no other file changed
  2. Zod validation on `practice.json` at app boot produces a human-readable field-specific error (not a stack trace) when a required field is missing or a color value is malformed
  3. `scripts/validate-contrast.ts` hard-fails CI when a practice's `primaryColor` does not meet WCAG AA 4.5:1 contrast against the text color — not an advisory warning
  4. Switching the browser to Spanish, French, or German renders the full survey UI in the correct locale with zero blank labels
  5. `byteworthy.config.yaml` pins `brand_kit_version` and is present in the repo root
**Plans**: TBD
**UI hint**: yes
**Watch out for**:
  - C-1 (invalid `practice.json` ships broken site → Zod with field-specific messages + `validate-practice-config` in fork instructions)
  - C-2 (practice brand color fails WCAG AA → `scripts/validate-contrast.ts` CI hard fail)
  - C-3 (empty-string translation placeholders cause blank labels → `allowEmptyMessage: false` + CI grep for `": ""` in non-EN files)
  - C-4 (unvalidated locale translations invalidate scores → validated-translations-only allowlist; CI warning on new `messages/XX.json`)
  - A-2 (HIPAA privacy docs land in Phase 2 → `docs/PRIVACY-COMPLIANCE.md` with plain-language local-only architecture statement; aggregate submit section for Phase 5)
  - A-6 (practice schema `aggregateEndpoint` description must include BA disclaimer text → `practice.schema.json` built with disclaimer in Phase 2)

---

### Phase 3: Patient/Clinician Value
**Goal**: A patient who completes a baseline survey can see their score history on a trend chart, export a practice-branded PDF for their clinician, receive local reminders at follow-up intervals, and be prompted to install the PWA to protect their data from iOS eviction
**Depends on**: Phase 2
**Requirements**: VIZ-01, VIZ-02, VIZ-03, VIZ-04, PDF-01, PDF-02, PDF-03, PDF-04, PDF-05, REM-01, REM-02, REM-03, REM-04, REM-05, PWA-01, PWA-02, PWA-03, PWA-04, PWA-05, PWA-06, PWA-07, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, NOPE-01, NOPE-02, NOPE-03, NOPE-04, NOPE-05, NOPE-06, NOPE-07
**Success Criteria** (what must be TRUE):
  1. The results screen shows a longitudinal uPlot chart with Y-axis labeled "Higher = better", a visually-hidden `<table>` fallback for screen readers, and no clinical interpretation copy of any kind
  2. Tapping "Export PDF" on iOS Safari generates a one-page practice-branded PDF that includes the chart (not a blank box) — canvas snapshot injected as `<img>` before `window.print()` — tested on Chrome + Firefox + iOS Safari
  3. After completing baseline, the Web Notification permission prompt fires; a test with shortened interval confirms a notification arrives and an in-app banner appears when notifications are unavailable or capped
  4. The app achieves Lighthouse Accessibility score ≥ 95 on a PR build, all tap targets are 44×44px minimum, and VoiceOver (iOS) + NVDA (Windows) can navigate the full survey and results flows
  5. CI `grep -r "fetch\|beacon\|analytics\|sentry" dist/` produces zero hits confirming no telemetry in the built output
**Plans**: TBD
**UI hint**: yes
**Watch out for**:
  - B-2 (canvas silent-fail in `window.print()` on iOS → `canvas.toDataURL()` injected as `<img>`, wait for uPlot `hooks.ready` before printing; manual three-browser test required before phase closes)
  - B-4 (iOS 7-day storage eviction destroys longitudinal story → prominent install prompt after baseline; detect `window.navigator.standalone === false` + iOS UA; show on every session until installed)
  - E-4 (reminder fatigue causes PWA uninstall → max 2 push notifications per interval; `{firedCount, acknowledged}` in IndexedDB; in-app banner replaces push after cap)
  - B-6 (print CSS inconsistencies → block layout only in `@media print`; `@page { margin: 1.5cm; }`; manual test Chrome + Firefox + iOS Safari before phase closes)
  - B-1 (SW update strategy confirmed before reminders → `registerType: 'prompt'`; banner shown only when NOT on `/#/survey` route)

---

### Phase 4: Repo Virality + GH Pages Deploy
**Goal**: `github.com/ByteWorthyLLC/vqol` is a public, landing-page-quality repo — live demo loads in under 2s on mobile Safari with realistic seeded data, Lighthouse scores ≥ 90 across all categories, README hero with animated GIF, and v0.1.0 is tagged and released
**Depends on**: Phase 3
**Requirements**: REPO-01, REPO-02, REPO-03, REPO-04, REPO-05, REPO-06, REPO-07, REPO-08, REPO-09, REPO-10, REPO-11, REPO-12, REPO-13, REPO-14, REPO-15, REPO-16, REPO-17, REPO-18, CI-01, CI-02, CI-03, CI-04, CI-05, LAUN-01, LAUN-02, LAUN-03, LAUN-04
**Success Criteria** (what must be TRUE):
  1. GitHub Pages demo at `byteworthyllc.github.io/vqol` loads with a realistic seeded patient trend chart visible on first visit — Lighthouse performance ≥ 90, accessibility ≥ 95, best-practices ≥ 95, SEO ≥ 95 on a PR build
  2. README renders with hero copy, animated demo GIF, "Deploy in 5 minutes" CTA, screenshot grid, and badges (license, build status, Lighthouse, fork count) — all images resolve, all badge URLs are live
  3. Repo scaffolded via `byteworthy-brand-kit` (`_style/scripts/scaffold-product.sh` per `onboarding-new-product.md`) — `byteworthy.config.yaml` present and pins `brand_kit_version`; CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md, GOVERNANCE.md sourced from brand-kit templates
  4. CI pipeline on every PR: lint + typecheck + Vitest + Lighthouse + telemetry audit (`grep -r "fetch\|beacon\|analytics\|sentry" dist/`) + contrast validate + practice.json Zod validation — all gates hard-fail
  5. v0.1.0 GitHub Release is tagged, signed, has download links, demo URL, and CHANGELOG entry; Show HN draft reviewed against the live demo before posting
**Plans**: TBD
**Watch out for**:
  - D-1 (Show HN backfire from missing demo or false outcome claims → demo must be live with realistic seeded data on mobile Safari before any launch post; Show HN draft reviewed against actual demo)
  - D-2 (Reddit subreddit moderation bans → pre-contact mods for r/varicoseveins, r/vascular, r/lymphedema; patient-utility framing; link to github.com not a custom domain)
  - D-4 (outcomes claims imply clinical validation of the tool → README copy: all claims cite the instrument, never vqol itself; use viral-launch-playbook.md Show HN template)
  - D-3 (practice asks for BAA → SECURITY.md must contain explicit "ByteWorthyLLC is not a Business Associate" language)
  - B-5 (accidental telemetry via transitive deps → CI `grep -r "fetch\|beacon\|analytics\|sentry" dist/` hard-fails on any hit; NOPE-03 enforced by CI-03)
  - A-3 (FDA SaMD copy review → README marketing copy reviewed for any severity/interpretation language before public launch)

---

### Phase 5: Aggregate Submit + Cluster lib Extraction
**Goal**: A practice can enable opt-in anonymous aggregate score submission; `lib/` modules are documented as copy-paste-ready cluster utilities; and the first real-patient deployment at the author's vein center is live with the operator fork recorded in `FORKS.md`
**Depends on**: Phase 4
**Requirements**: AGG-01, AGG-02, AGG-03, AGG-04, AGG-05, OPER-01, OPER-02
**Success Criteria** (what must be TRUE):
  1. Setting `aggregateSubmit: true` + `aggregateEndpoint: "https://..."` in `practice.json` causes anonymized score payloads (session ID, scores, practice ID — no patient identifiers) to POST to the practice endpoint; setting `http://` endpoint is rejected at runtime with a `console.error`
  2. The `examples/aggregate-receiver/` Cloudflare Worker + KV starter template deploys without modification to a practice's CF account and receives the payload
  3. `lib/practice-config/`, `lib/i18n-loader/`, `lib/pdf-export/`, and `lib/aggregate-submit/` each have a `README.md` explaining copy-paste-to-next-cluster-tool instructions — all four modules are stable and documented
  4. The author's vein/vascular center fork is deployed at a real URL, a real patient has completed a baseline survey, and that practice fork is the first entry in `FORKS.md`
**Plans**: TBD
**Watch out for**:
  - A-2 (HIPAA exposure from unsecured aggregate endpoint → HTTPS-only enforcement in `lib/practice-config/validate.ts` + runtime rejection of `http://`)
  - A-6 (practice asks ByteWorthyLLC to sign BAA for aggregate feature → SECURITY.md already contains BA disclaimer from Phase 4; `practice.schema.json` `aggregateEndpoint` description includes BA disclaimer text from Phase 2)
  - A-4 (state telehealth/privacy regulations for aggregate submit → `docs/PRIVACY-COMPLIANCE.md` includes state law section noting WA/CA/IL practices enabling aggregate submit must consult their legal counsel)

---

## Progress

**Execution Order:**
Phase 0 (async, starts immediately) || Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Legal Gate | 0/TBD | Not started | - |
| 1. Vertical Slice — Survey + Scoring + Storage | 0/TBD | Not started | - |
| 2. White-label + i18n | 0/TBD | Not started | - |
| 3. Patient/Clinician Value | 0/TBD | Not started | - |
| 4. Repo Virality + GH Pages Deploy | 0/TBD | Not started | - |
| 5. Aggregate Submit + Cluster lib Extraction | 0/TBD | Not started | - |
