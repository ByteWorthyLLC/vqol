# Requirements: vqol

Defined: 2026-04-25
Updated: 2026-04-27

## Status Summary

| Area | Status |
|---|---|
| Survey | Mostly complete, placeholder instrument content |
| Scoring | Algorithm shape complete, real constants blocked by license |
| Storage | Complete |
| White-label | Complete |
| i18n | Complete for app chrome, instrument translations blocked by license |
| Visualization | Complete |
| PDF export | Complete, real-device testing pending |
| Reminders | Core scheduling complete, real-device behavior pending |
| PWA | Build artifacts complete, real-device verification pending |
| Accessibility | Basic implementation complete, formal/manual audits pending |
| Anti-features | Enforced by design and docs |
| Repo launch | In progress |
| Curiosity-led virality | Core artifacts implemented and deployed, assets pending |
| Aggregate submit | Implemented, disabled by default |
| Operator deployment | Pending |
| Creative application tooling | Complete |
| Viral functionality and marketing | Active in Phase 7 |

## Phase 0: Legal Gate

- [ ] **LEGL-01**: LSHTM licensing inquiry email sent.
- [ ] **LEGL-02**: Written response received, or fallback strategy executed.
- [x] **LEGL-03**: `INSTRUMENT-LICENSE.md` committed with provenance, citations, and status log.

## Phase 1: Survey, Scoring, Storage

- [x] **SURV-01**: User can take the local survey flow on mobile or desktop.
- [x] **SURV-02**: One question shown per screen.
- [x] **SURV-03**: Each answer is persisted to IndexedDB on selection.
- [x] **SURV-04**: Resume CTA appears on the home screen if a draft exists.
- [x] **SURV-05**: Locale is locked at survey start; selector is not rendered on survey route.
- [x] **SURV-06**: Submit controls stay in a fixed bottom bar with `100svh` layout.
- [x] **SURV-07**: Survey enforces an 80% scoreability threshold.
- [x] **SURV-08**: Time-per-question is tracked locally.
- [x] **SCOR-01**: Pure TypeScript scoring function implements VEINES-QOL T-score shape.
- [x] **SCOR-02**: Pure TypeScript scoring function implements VEINES-Sym T-score shape.
- [x] **SCOR-03**: Reverse-scoring exists for Q3, Q6, Q7.
- [ ] **SCOR-04**: Real item-level normative means and SDs are bundled after permission.
- [x] **SCOR-05**: Scoring engine has no I/O.
- [ ] **SCOR-06**: Tests verify against published examples after real constants are available.
- [x] **STOR-01**: Patient data stored in IndexedDB through `idb`.
- [x] **STOR-02**: Only `src/lib/storage/` opens IndexedDB.
- [x] **STOR-03**: `sessions`, `scores`, and `meta` stores exist.
- [x] **STOR-04**: No patient-data network path exists by default.
- [x] **STOR-05**: `fake-indexeddb/auto` is wired into Vitest setup.

## Phase 2: White-label + i18n

- [x] **BRND-01**: Practice branding is controlled through `public/practice.json`.
- [x] **BRND-02**: Config validator returns field-specific errors.
- [x] **BRND-03**: Brand colors are applied through CSS custom properties.
- [x] **BRND-04**: Contrast audit hard-fails on WCAG AA violations.
- [x] **BRND-05**: Practice name, logo, contact, locale, and aggregate feature flags exist.
- [x] **BRND-06**: `byteworthy.config.yaml` exists.
- [x] **I18N-01**: en/es/fr/de are loaded at runtime as separate message chunks.
- [x] **I18N-02**: Empty translations fail validation.
- [x] **I18N-03**: Locale key drift fails validation.
- [x] **I18N-04**: Locale allowlist warning exists in translation validation.
- [x] **I18N-05**: Locale choice persists to localStorage.

## Phase 3: Patient/Clinician Value

- [x] **VIZ-01**: Results route renders longitudinal uPlot chart.
- [x] **VIZ-02**: Chart labels communicate "higher = better".
- [x] **VIZ-03**: Chart has `role="img"`, `aria-label`, and hidden table fallback.
- [x] **VIZ-04**: Chart canvas is exposed for PDF snapshot.
- [x] **PDF-01**: Report export uses `window.print()` and print CSS.
- [x] **PDF-02**: Print CSS uses block-friendly print layout and page margins.
- [x] **PDF-03**: Canvas snapshot is injected as an image before print.
- [x] **PDF-04**: Print template includes practice info, scores, history, citation, and data ownership copy.
- [ ] **PDF-05**: PDF export verified on Chrome, Firefox, and iOS Safari.
- [x] **REM-01**: Notification permission helper exists and is not invoked before baseline.
- [x] **REM-02**: 1mo, 3mo, 6mo, and 1yr intervals exist.
- [x] **REM-03**: In-app reminder banner exists.
- [x] **REM-04**: Reminder cap state persists in IndexedDB metadata.
- [x] **REM-05**: Cap logic can switch to in-app banner behavior.
- [x] **PWA-01**: Manifest and service worker build.
- [x] **PWA-02**: vite-plugin-pwa is configured.
- [x] **PWA-03**: Service worker uses `registerType: 'prompt'`.
- [x] **PWA-04**: App shell assets are precached.
- [x] **PWA-05**: IndexedDB is not proxied through service worker.
- [x] **PWA-06**: Outdated cache cleanup is enabled.
- [x] **PWA-07**: Install prompt component exists.
- [x] **PWA-08**: Service-worker update prompt renders and disables reload during an active survey.
- [x] **A11Y-01**: Brand colors are checked for WCAG contrast.
- [x] **A11Y-02**: 44px tap target baseline exists.
- [ ] **A11Y-03**: Lighthouse accessibility gate runs in CI.
- [x] **A11Y-04**: Native controls support keyboard navigation.
- [ ] **A11Y-05**: VoiceOver and NVDA manual testing completed.
- [x] **NOPE-01**: No clinical interpretation on results screen.
- [x] **NOPE-02**: No severity labels or score color coding.
- [x] **NOPE-03**: Telemetry audit script exists.
- [x] **NOPE-04**: No account system.
- [x] **NOPE-05**: No backend required by default.
- [x] **NOPE-06**: No third-party push service.
- [x] **NOPE-07**: No EHR integration.

## Phase 4: Repo Launch

- [x] **REPO-01**: Public repo exists at `github.com/ByteWorthyLLC/vqol`.
- [x] **REPO-02**: MIT license exists in repo root.
- [x] **REPO-03**: Repo hygiene files and ByteWorthy config exist.
- [x] **REPO-04**: README exists with setup, status, privacy, and launch blockers.
- [x] **REPO-05**: Live GitHub Pages demo exists.
- [x] **REPO-06**: Contributing docs include anti-features.
- [x] **REPO-07**: Code of conduct exists.
- [x] **REPO-08**: Security doc includes Business Associate notice.
- [x] **REPO-09**: Support doc and FAQ exist.
- [x] **REPO-10**: Public roadmap exists.
- [x] **REPO-11**: Changelog exists.
- [x] **REPO-12**: Issue templates exist.
- [x] **REPO-13**: Discussions are enabled and seeded.
- [x] **REPO-14**: Repo topics are documented in `byteworthy.config.yaml`.
- [x] **REPO-15**: Fork registry exists.
- [x] **REPO-16**: Governance doc exists.
- [x] **REPO-17**: Instrument license doc exists.
- [ ] **REPO-18**: Signed release/tag workflow verified.
- [x] **CI-01**: GitHub Actions CI runs `npm run verify`.
- [x] **CI-02**: GitHub Pages deploy workflow exists.
- [x] **CI-03**: Telemetry audit exists.
- [x] **CI-04**: Practice config validation runs through app/check scripts.
- [x] **CI-05**: Contrast validation runs in `npm run check`.
- [ ] **LAUN-01**: v0.1.0 release tagged.
- [ ] **LAUN-02**: Show HN draft reviewed against live demo.
- [ ] **LAUN-03**: Reddit moderator pre-contact completed.
- [ ] **LAUN-04**: Outcome claims reviewed for instrument-vs-tool distinction.

## Phase 4: Curiosity-Led Virality

- [x] **CURIO-01**: Seeded demo mode shows fake longitudinal scores immediately without writing fake data into real patient history.
- [x] **CURIO-02**: Local-first proof panel visibly explains no backend, no accounts, no analytics, browser-local storage, and telemetry audit.
- [x] **CURIO-03**: One-file fork proof shows how `public/practice.json` changes branding and contact details.
- [x] **CURIO-04**: Offline challenge is documented and testable from the live demo.
- [x] **CURIO-05**: Reference-only / bring-your-own-instrument mode is documented as the legal-safe architecture if LSHTM permission is unresolved.
- [x] **CURIO-06**: Waiting-room QR poster prototype exists as a printable operational artifact.
- [x] **CURIO-07**: Calendar follow-up export is scoped as a no-server reminder fallback.
- [x] **CURIO-08**: Weird lab/demo surface exists only for fake-data experiments and cannot affect patient history.
- [ ] **CURIO-09**: Public copy leads with constraints, proofs, and implementation details rather than promotion.
- [ ] **CURIO-10**: HN/Reddit/LinkedIn drafts are written only after the artifacts they describe are real.

## Phase 5: Aggregate Submit + Operator Deployment

- [x] **AGG-01**: `aggregateSubmit` defaults to false in `practice.json`.
- [x] **AGG-02**: Enabled aggregate submit posts anonymized payload.
- [x] **AGG-03**: Config validator rejects insecure aggregate endpoints.
- [x] **AGG-04**: Schema docs include aggregate endpoint BA disclaimer.
- [x] **AGG-05**: Cloudflare Worker receiver example exists.
- [ ] **OPER-01**: First operator deployment is live.
- [ ] **OPER-02**: First operator deployment is listed in `FORKS.md`.

## Phase 6: Creative Application Amplification

- [x] **STUD-01**: Synthetic cohort generator is deterministic by seed.
- [x] **STUD-02**: Outcomes Studio exposes adjustable cohort assumptions.
- [x] **STUD-03**: Outcomes Studio compares current and stronger follow-up protocols.
- [x] **STUD-04**: Outcomes Studio exports fake CSV.
- [x] **STUD-05**: Outcomes Studio exports a protocol brief with synthetic-data caveat.
- [x] **FORG-01**: Practice Forge builds a usable `practice.json`.
- [x] **FORG-02**: Practice Forge validates generated config with the runtime validator.
- [x] **FORG-03**: Practice Forge surfaces fork-readiness score.
- [x] **FORG-04**: Practice Forge can copy or download generated JSON.
- [x] **FORG-05**: Studio/Forge do not write patient IndexedDB records.

## Phase 7: Viral Functionality and Marketing

- [x] **VIRL-01**: Launch Kit route generates share artifacts from real app routes.
- [x] **VIRL-02**: Launch artifacts include technical post, clinician pilot email, contributor challenge, AI citation block, and remix loop.
- [x] **VIRL-03**: Generated links point to demo, proof, studio, forge, poster, and repo.
- [x] **VIRL-04**: Launch Kit exposes a utility-first readiness rubric.
- [x] **VIRL-05**: Launch brief can be copied or downloaded as Markdown.
- [x] **VIRL-06**: Weird experiment issue template exists for contributor conversion.
- [x] **VIRL-07**: Viral playbook documents what can and cannot be claimed.
- [x] **VIRL-08**: Launch Kit does not add analytics, accounts, patient-data writes, or backend dependency.

## Deferred v2

- CIVIQ-20 and AVVQ modules.
- Device migration import/export.
- Practice dashboard.
- FHIR export.
- Shared cluster toolkit package.
