# Requirements: vqol

**Defined:** 2026-04-25
**Core Value:** A patient-facing, free, validated PRO instrument tracker that produces a real outcomes story for the practice — without requiring engineering, hosting, or per-response licensing fees that closed PRO platforms charge. The repo is the product: every star, fork, and deploy is distribution.

---

## v1 Requirements

### Survey

- [ ] **SURV-01**: User can take VEINES-QOL/Sym 26-item questionnaire (25 scored items + Q2 descriptive) in one sitting on mobile or desktop
- [ ] **SURV-02**: One question shown per screen (mitigates ceiling-effect response bias)
- [ ] **SURV-03**: Each answer is persisted to IndexedDB on selection (draft-save) so a survey can be resumed after page reload, app close, or service-worker update
- [ ] **SURV-04**: A "Resume survey" CTA appears on the home screen if a draft session exists
- [ ] **SURV-05**: Locale is locked at survey start; locale selector is disabled on the survey route
- [ ] **SURV-06**: Submit button remains visible above the iOS keyboard (uses `100svh`, fixed bottom bar)
- [ ] **SURV-07**: Survey requires ≤20% missing items to be scoreable; below threshold returns "Incomplete — please complete remaining items"
- [ ] **SURV-08**: Time-per-question is tracked locally; total < 45s flags a gentle "did you read?" reconfirmation

### Scoring

- [ ] **SCOR-01**: Pure-TS scoring engine implements VEINES-QOL T-score (25 items) per Lamping 2003 / Kahn 2006
- [ ] **SCOR-02**: Pure-TS scoring engine implements VEINES-Sym T-score (10 items) per same publications
- [ ] **SCOR-03**: Reverse-scoring applied to Q3, Q6, Q7 per published algorithm
- [ ] **SCOR-04**: Item-level normative means and SDs (Lamping 2003 sample) bundled in `scoring/constants.ts`
- [ ] **SCOR-05**: Scoring engine has no I/O — testable in isolation with Vitest
- [ ] **SCOR-06**: Vitest unit tests verify scoring engine against all published example inputs from Lamping 2003 + Kahn 2006

### Storage

- [ ] **STOR-01**: All patient data stored in IndexedDB via `idb` v8+ wrapper
- [ ] **STOR-02**: Singleton DB pattern — only the `storage/` module opens IndexedDB
- [ ] **STOR-03**: Three object stores: `sessions` (drafts + completed), `scores` (calculated history), `meta` (locale lock, install state, notification cap counters)
- [ ] **STOR-04**: Zero network calls for patient data — verified by CI grep on `dist/`
- [ ] **STOR-05**: `fake-indexeddb/auto` adapter wired into Vitest setup for deterministic test runs

### Visualization

- [ ] **VIZ-01**: Longitudinal trend chart on `/#/results` route renders score history (uPlot, lazy-imported)
- [ ] **VIZ-02**: Y-axis labeled "Higher = better" — no ambiguity
- [ ] **VIZ-03**: Chart accessible: `aria-label` + `role="img"` + visually-hidden `<table>` fallback for screen readers
- [ ] **VIZ-04**: `canvas.toDataURL()` exposed for PDF export consumption

### PDF Export

- [ ] **PDF-01**: Clinician-ready one-page PDF export via `window.print()` + `@media print` CSS (zero bundle cost)
- [ ] **PDF-02**: Print template uses block layout only (no Grid, no flex-wrap), `@page { margin: 1.5cm; }`
- [ ] **PDF-03**: Chart canvas snapshotted via `canvas.toDataURL()` and injected as `<img>` before `window.print()` invoked (iOS Safari silent-fail mitigation)
- [ ] **PDF-04**: PDF includes practice name, logo, contact (from practice.json), score, prior score, delta, "Higher = better" note, citation to Lamping 2003 + Kahn 2006
- [ ] **PDF-05**: PDF tested on Chrome + Firefox + iOS Safari before phase closes

### Reminders

- [ ] **REM-01**: Web Notification permission prompt fired after baseline survey completion (not before)
- [ ] **REM-02**: Reminders scheduled at 1mo / 3mo / 6mo / 1yr post-baseline
- [ ] **REM-03**: iOS in-app banner fallback fires on app open when Web Notifications unavailable
- [ ] **REM-04**: Max 2 push notifications per interval (`{firedCount, acknowledged}` in IndexedDB)
- [ ] **REM-05**: After cap, in-app banner replaces push for that interval

### White-label (`practice.json`)

- [ ] **BRND-01**: Single `practice.json` is the ONLY file a forking practice edits
- [ ] **BRND-02**: Schema validated by Zod with field-specific human-readable error messages on app boot
- [ ] **BRND-03**: Brand colors applied via CSS custom properties at boot
- [ ] **BRND-04**: Brand-color contrast checked at build time by `scripts/validate-contrast.ts` — CI hard fail (not advisory) on WCAG AA failure
- [ ] **BRND-05**: Practice name, logo URL or base64, primary contact, optional reminder cadence override
- [ ] **BRND-06**: `byteworthy.config.yaml` pins `brand_kit_version` per byteworthy-brand-kit pattern

### i18n

- [ ] **I18N-01**: paraglide-js wires en/es/fr/de at build time
- [ ] **I18N-02**: `allowEmptyMessage: false` — empty translations fail build
- [ ] **I18N-03**: CI grep for `": ""` in non-EN message files
- [ ] **I18N-04**: Validated-translations-only allowlist — only en/es/fr/de/it/nl/pt accepted; CONTRIBUTING.md requires citation for new locale
- [ ] **I18N-05**: Locale persisted to localStorage (separate from per-survey lock)

### PWA

- [ ] **PWA-01**: Installable PWA — manifest + service worker + offline shell
- [ ] **PWA-02**: vite-plugin-pwa with `injectManifest` strategy
- [ ] **PWA-03**: `registerType: 'prompt'` — never auto-update mid-survey (B-1 mitigation)
- [ ] **PWA-04**: App shell precached: index.html, JS chunks, CSS, translations, `practice.json`, icons
- [ ] **PWA-05**: IndexedDB never proxied through service worker
- [ ] **PWA-06**: `cleanupOutdatedCaches: true` to prevent stale-cache accumulation
- [ ] **PWA-07**: "Add to Home Screen" prompt shown after baseline survey completion (iOS 7-day eviction mitigation)

### Accessibility

- [ ] **A11Y-01**: WCAG 2.1 AA — 4.5:1 text contrast, 3:1 UI-component contrast
- [ ] **A11Y-02**: 44×44px minimum tap targets
- [ ] **A11Y-03**: Lighthouse Accessibility ≥ 95 on every PR
- [ ] **A11Y-04**: Keyboard navigation works for full survey + chart + PDF flows
- [ ] **A11Y-05**: Screen-reader testing on VoiceOver (iOS) + NVDA (Windows) before v0.1.0

### Anti-features (enforced)

- [ ] **NOPE-01**: Zero clinical interpretation copy on results screen — score + delta + "Higher = better" + "Share with provider" only (FDA SaMD exclusion)
- [ ] **NOPE-02**: No severity labels, no color coding for scores
- [ ] **NOPE-03**: No telemetry — CI: `grep -r "fetch\|beacon\|analytics\|sentry" dist/` fails on any hit
- [ ] **NOPE-04**: No account system / login
- [ ] **NOPE-05**: No backend / server / hosted SaaS
- [ ] **NOPE-06**: No third-party push notification service
- [ ] **NOPE-07**: No EHR / EMR integration

### Repo Virality

- [ ] **REPO-01**: Public repo at `github.com/ByteWorthyLLC/vqol`
- [ ] **REPO-02**: MIT LICENSE in repo root
- [ ] **REPO-03**: Scaffolded via `byteworthy-brand-kit` (`_style/scripts/scaffold-product.sh`) — inherits canonical README template, .github templates, CODE_OF_CONDUCT.md, CONTRIBUTING.md, SECURITY.md
- [ ] **REPO-04**: README hero with one-line pitch, animated demo GIF, "Deploy in 5 minutes" CTA, screenshot grid, badges (license, build, Lighthouse, fork count)
- [ ] **REPO-05**: Live demo on GitHub Pages with realistic seeded patient data — first visitor sees the trend chart immediately
- [ ] **REPO-06**: CONTRIBUTING.md explicit anti-features section (no telemetry, no clinical interpretation, validated-translations-only)
- [ ] **REPO-07**: CODE_OF_CONDUCT.md = Contributor Covenant v3.0 (July 2025)
- [ ] **REPO-08**: SECURITY.md with private vuln-report channel + explicit "ByteWorthyLLC is not a Business Associate" language
- [ ] **REPO-09**: SUPPORT.md and FAQ
- [ ] **REPO-10**: Public ROADMAP.md visible on the repo
- [ ] **REPO-11**: CHANGELOG.md following Keep a Changelog
- [ ] **REPO-12**: Issue templates: bug, feature, "deploy your practice" (each fork submission gets visibility)
- [ ] **REPO-13**: GitHub Discussions enabled with seed posts (intro, "share your fork", "request a translation", "instrument licensing FAQ")
- [ ] **REPO-14**: Repo description, topics (`vein`, `healthcare`, `pwa`, `pro-tracker`, `veines-qol`, `open-source-health`, `fork-and-deploy`), social preview image
- [ ] **REPO-15**: `FORKS.md` hand-curated registry of clinic deployments — turns forks into compounding social proof
- [ ] **REPO-16**: GOVERNANCE.md naming maintainer + decision process
- [ ] **REPO-17**: INSTRUMENT-LICENSE.md crediting Lamping 2003 + Kahn 2006 + LSHTM (regardless of permission outcome)
- [ ] **REPO-18**: Web commit signoff enforced (ByteWorthyLLC org policy) — all commits and tags signed

### CI/CD

- [ ] **CI-01**: GitHub Actions `ci.yml` runs on PR: lint (eslint + svelte-check) + typecheck (`tsc --noEmit`) + Vitest + Lighthouse CI (assertions: perf ≥ 90, a11y ≥ 95, best-practices ≥ 95, SEO ≥ 95)
- [ ] **CI-02**: GitHub Actions `deploy.yml` runs on push to `main`: build + deploy to GitHub Pages via `actions/deploy-pages@v4` (no `gh-pages` branch)
- [ ] **CI-03**: CI step audits built `dist/` for telemetry SDKs — `grep -r "fetch\|beacon\|analytics\|sentry" dist/` fails on any hit
- [ ] **CI-04**: CI step validates `practice.json` example via Zod
- [ ] **CI-05**: CI step runs `validate-contrast.ts` against bundled brand colors

### Aggregate Submit (off by default in v1)

- [ ] **AGG-01**: `aggregateSubmit` in `practice.json` defaults to `false`
- [ ] **AGG-02**: When enabled, anonymized payload (session ID, scores, practice ID) POSTed to practice-controlled endpoint
- [ ] **AGG-03**: Endpoint URL must be HTTPS — runtime rejection of `http://` with `console.error`
- [ ] **AGG-04**: `practice.schema.json` `aggregateEndpoint` description includes BA disclaimer text
- [ ] **AGG-05**: Cloudflare Worker + KV starter template included in `examples/aggregate-receiver/` for practices

### Operator Validation

- [ ] **OPER-01**: First production deployment lives at the author's own vein/vascular center (real practice, real patient takes baseline survey)
- [ ] **OPER-02**: Operator-deployed fork added as the first entry in `FORKS.md`

### Launch

- [ ] **LAUN-01**: v0.1.0 GitHub Release tagged with download links + demo URL + changelog
- [ ] **LAUN-02**: Show HN draft reviewed against live demo before posting
- [ ] **LAUN-03**: Reddit moderator pre-contact for r/varicoseveins, r/vascular, r/lymphedema
- [ ] **LAUN-04**: All outcome claims attribute the instrument (Lamping 2003), not the tool (vqol)

---

## Phase 0 Gate (parallel with Phase 1)

- [ ] **LEGL-01**: LSHTM licensing inquiry email sent (per `.planning/legal/lshtm-inquiry-email.md`)
- [ ] **LEGL-02**: Written response received OR fallback strategy executed (per `.planning/legal/fallback-plan.md`)
- [ ] **LEGL-03**: INSTRUMENT-LICENSE.md committed to repo root regardless of outcome

---

## v2 Requirements (deferred)

### Additional Instruments
- **CIVIQ-20**: Alternative CVD PRO instrument; modular architecture supports it
- **AVVQ**: Aberdeen Varicose Vein Questionnaire

### Translations
- **es-419** (Latin American Spanish), **pt** (Portuguese), **it** (Italian), **nl** (Dutch), **sv** (Swedish) — pending validated translations

### Practice Tools
- **DASH-01**: Practice-side dashboard for cross-patient aggregate viewing (requires deploy-time auth — kills static-PWA story unless reimagined)
- **EXIM-01**: IndexedDB JSON export/import for patient device migration

### Cluster Integration
- **CLUS-01**: Cross-link to postsclera (post-procedure companion) on results screen
- **CLUS-02**: Cross-link to veinquest (pre-consult education) on home screen
- **CLUS-03**: Shared `@byteworthy/vein-toolkit` npm package once 3+ cluster tools active

### EHR
- **FHIR-01**: FHIR Observation export of scores

---

## Out of Scope (explicit exclusions)

| Feature | Reason |
|---------|--------|
| Hosted SaaS / multi-tenant deployment | Defeats the fork-and-host moat AND kills the virality story |
| Account systems / login / server-side identity | Patient data ownership is the privacy story; no accounts = no auth surface |
| Diagnosis or interpretation beyond score calculation | Crosses FDA SaMD exclusion boundary |
| Color-coded severity indicators on results | Same as above |
| Telemetry / analytics / Sentry / GA / Plausible | Antithesis of the privacy moat; CI enforces |
| Direct EHR integration | Out of scope for static PWA; PDF export bridges |
| Push notifications via third-party service (OneSignal etc.) | Privacy concern; Web Notifications API only |
| Paid tier / Pro features | Antithesis of viral OSS thesis |
| Practice-side dashboard for cross-patient view in v1 | Defeats static-PWA model; v2 with reimagined arch |

---

## Traceability

Generated by roadmapper 2026-04-25. Every v1 requirement mapped to exactly one phase.

| Requirement | Phase | Status |
|---|---|---|
| SURV-01 | Phase 1 | Pending |
| SURV-02 | Phase 1 | Pending |
| SURV-03 | Phase 1 | Pending |
| SURV-04 | Phase 1 | Pending |
| SURV-05 | Phase 1 | Pending |
| SURV-06 | Phase 1 | Pending |
| SURV-07 | Phase 1 | Pending |
| SURV-08 | Phase 1 | Pending |
| SCOR-01 | Phase 1 | Pending |
| SCOR-02 | Phase 1 | Pending |
| SCOR-03 | Phase 1 | Pending |
| SCOR-04 | Phase 1 | Pending |
| SCOR-05 | Phase 1 | Pending |
| SCOR-06 | Phase 1 | Pending |
| STOR-01 | Phase 1 | Pending |
| STOR-02 | Phase 1 | Pending |
| STOR-03 | Phase 1 | Pending |
| STOR-04 | Phase 1 | Pending |
| STOR-05 | Phase 1 | Pending |
| BRND-01 | Phase 2 | Pending |
| BRND-02 | Phase 2 | Pending |
| BRND-03 | Phase 2 | Pending |
| BRND-04 | Phase 2 | Pending |
| BRND-05 | Phase 2 | Pending |
| BRND-06 | Phase 2 | Pending |
| I18N-01 | Phase 2 | Pending |
| I18N-02 | Phase 2 | Pending |
| I18N-03 | Phase 2 | Pending |
| I18N-04 | Phase 2 | Pending |
| I18N-05 | Phase 2 | Pending |
| VIZ-01 | Phase 3 | Pending |
| VIZ-02 | Phase 3 | Pending |
| VIZ-03 | Phase 3 | Pending |
| VIZ-04 | Phase 3 | Pending |
| PDF-01 | Phase 3 | Pending |
| PDF-02 | Phase 3 | Pending |
| PDF-03 | Phase 3 | Pending |
| PDF-04 | Phase 3 | Pending |
| PDF-05 | Phase 3 | Pending |
| REM-01 | Phase 3 | Pending |
| REM-02 | Phase 3 | Pending |
| REM-03 | Phase 3 | Pending |
| REM-04 | Phase 3 | Pending |
| REM-05 | Phase 3 | Pending |
| PWA-01 | Phase 3 | Pending |
| PWA-02 | Phase 3 | Pending |
| PWA-03 | Phase 3 | Pending |
| PWA-04 | Phase 3 | Pending |
| PWA-05 | Phase 3 | Pending |
| PWA-06 | Phase 3 | Pending |
| PWA-07 | Phase 3 | Pending |
| A11Y-01 | Phase 3 | Pending |
| A11Y-02 | Phase 3 | Pending |
| A11Y-03 | Phase 3 | Pending |
| A11Y-04 | Phase 3 | Pending |
| A11Y-05 | Phase 3 | Pending |
| NOPE-01 | Phase 3 | Pending |
| NOPE-02 | Phase 3 | Pending |
| NOPE-03 | Phase 3 | Pending |
| NOPE-04 | Phase 3 | Pending |
| NOPE-05 | Phase 3 | Pending |
| NOPE-06 | Phase 3 | Pending |
| NOPE-07 | Phase 3 | Pending |
| REPO-01 | Phase 4 | Pending |
| REPO-02 | Phase 4 | Pending |
| REPO-03 | Phase 4 | Pending |
| REPO-04 | Phase 4 | Pending |
| REPO-05 | Phase 4 | Pending |
| REPO-06 | Phase 4 | Pending |
| REPO-07 | Phase 4 | Pending |
| REPO-08 | Phase 4 | Pending |
| REPO-09 | Phase 4 | Pending |
| REPO-10 | Phase 4 | Pending |
| REPO-11 | Phase 4 | Pending |
| REPO-12 | Phase 4 | Pending |
| REPO-13 | Phase 4 | Pending |
| REPO-14 | Phase 4 | Pending |
| REPO-15 | Phase 4 | Pending |
| REPO-16 | Phase 4 | Pending |
| REPO-17 | Phase 4 | Pending |
| REPO-18 | Phase 4 | Pending |
| CI-01 | Phase 4 | Pending |
| CI-02 | Phase 4 | Pending |
| CI-03 | Phase 4 | Pending |
| CI-04 | Phase 4 | Pending |
| CI-05 | Phase 4 | Pending |
| LAUN-01 | Phase 4 | Pending |
| LAUN-02 | Phase 4 | Pending |
| LAUN-03 | Phase 4 | Pending |
| LAUN-04 | Phase 4 | Pending |
| AGG-01 | Phase 5 | Pending |
| AGG-02 | Phase 5 | Pending |
| AGG-03 | Phase 5 | Pending |
| AGG-04 | Phase 5 | Pending |
| AGG-05 | Phase 5 | Pending |
| OPER-01 | Phase 5 | Pending |
| OPER-02 | Phase 5 | Pending |
| LEGL-01 | Phase 0 (parallel with Phase 1) | Pending |
| LEGL-02 | Phase 0 (parallel with Phase 1) | Pending |
| LEGL-03 | Phase 0 (parallel with Phase 1) | Pending |

**Coverage:** 79 v1 requirements (76 sequential + 3 Phase 0 legal gate); all mapped to phases ✓

**Phase summary:**
- Phase 0 (legal gate, async): LEGL-01..03 (3 requirements)
- Phase 1 (vertical slice): SURV-01..08, SCOR-01..06, STOR-01..05 (19 requirements)
- Phase 2 (white-label + i18n): BRND-01..06, I18N-01..05 (11 requirements)
- Phase 3 (patient/clinician value): VIZ-01..04, PDF-01..05, REM-01..05, PWA-01..07, A11Y-01..05, NOPE-01..07 (33 requirements)
- Phase 4 (repo virality + deploy): REPO-01..18, CI-01..05, LAUN-01..04 (27 requirements)
- Phase 5 (aggregate + cluster lib): AGG-01..05, OPER-01..02 (7 requirements)

---

*Requirements defined: 2026-04-25*
*Last updated: 2026-04-25 — traceability table filled by roadmapper*
