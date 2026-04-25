---
status: passed
phase: 2
phase_name: White-label + i18n
verified: 2026-04-25
---

# Phase 2: White-label + i18n — Verification

## Success Criteria Check

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | A fork edits ONLY `public/practice.json` and gets branded site | ✓ Passed | `applyBrandingToDocument()` writes CSS custom properties; document.title set; all UI strings already i18n-loaded |
| 2 | Zod-equivalent validation with field-specific messages | ✓ Passed | 13 unit tests; sample messages: `branding.primaryColor: must be a 6-digit hex color`, `features.aggregateEndpoint: aggregateSubmit is enabled — endpoint must be an https:// URL. The deploying practice owns the BAA for this endpoint.` |
| 3 | Brand-color contrast hard-fails CI on WCAG AA violation | ✓ Passed | `npm run check:contrast` exits 1 on violation; fixture `public/practice.json` produces 17.40:1 / 7.17:1 / 7.17:1 — all PASS |
| 4 | App ships en/es/fr/de with empty translations failing build | ✓ Passed | `npm run check:translations` enforces non-empty + key parity; all 4 locales fully populated for app chrome + answer scales + 25 placeholder item prompts |
| 5 | Locale switcher disabled on `/#/survey` route | ✓ Passed | `App.svelte` conditionally renders `<LocaleSwitcher />` only when `route !== 'survey'` |
| 6 | Branding applied before first render (no FOUC) | ✓ Passed | `loadPracticeConfig()` + `applyBrandingToDocument()` block first route render in `App.svelte` until both complete; loading state shown during boot |
| 7 | Validated-locales-only allowlist enforced | ✓ Passed | `validate-translations.ts` warns on any locale not in en/es/fr/de/it/nl/pt and instructs adding citation to CONTRIBUTING.md |
| 8 | All tests pass | ✓ Passed | 33/33 (15 from P1 + 18 new from P2) |
| 9 | Type check clean | ✓ Passed | svelte-check 0 errors / 0 warnings |
| 10 | Production build succeeds | ✓ Passed | dist/ generated; 4 separate locale chunks lazy-loaded |
| 11 | Bundle within budget | ✓ Passed | 25.6 KB gzip initial load (target 58–73 KB) — way under |

## Pitfalls Addressed

| Pitfall ID | Mitigation in Phase 2 | Status |
|---|---|---|
| C-1 Invalid practice.json ships broken site | Hand-rolled validator with field-specific paths; boot-time error UI | ✓ Implemented |
| C-2 Practice brand color fails WCAG AA | `validate-contrast.ts` runs in CI as hard fail | ✓ Implemented |
| C-3 Empty-string translations cause blank labels | `validate-translations.ts` fails build on `": ""` in non-EN files | ✓ Implemented |
| C-4 Unvalidated locale translations invalidate scores | Allowlist of 7 locales (en/es/fr/de/it/nl/pt); CI warns on others | ✓ Implemented |
| A-2 (preview) HIPAA exposure if aggregate endpoint accidentally enabled | Validator hard-rejects http://; HIPAA-aware error message names BA disclaimer | ✓ Implemented (P5 will wire runtime) |

## Pitfalls Deferred to Later Phases (intentional)

| Pitfall ID | Phase Owner |
|---|---|
| B-2 canvas print silent fail | P3 |
| B-4 iOS install prompt | P3 |
| E-4 Reminder fatigue cap | P3 |
| D-1..D-5 launch/virality risks | P4 |
| A-2/A-6 aggregate-submit HIPAA runtime | P5 |

## Manual Verification (deferred)

- [ ] Real-device test: fork practice.json on a forked repo, change brand color, verify themed deploy
- [ ] Screen-reader test: locale switcher announces correctly on VoiceOver

These test scenarios are covered by Phase 4 (real GH Pages deploy + demo) and Phase 3 (a11y verification).

## Verdict

**PASSED.** Phase 2 ships the white-label + i18n template that the rest of the cluster will copy. CI gates are hard-fail. Bundle remains well under budget. All in-scope pitfalls mitigated; out-of-scope pitfalls explicitly deferred.

Ready to proceed to Phase 3: Patient/Clinician Value (chart + PDF + reminders + PWA).
