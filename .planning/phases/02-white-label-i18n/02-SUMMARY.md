# Phase 2: White-label + i18n — Summary

**Status:** Complete
**Completed:** 2026-04-25

## What Shipped

### Practice config (`src/lib/practice-config/`)
- `types.ts` — TypeScript interfaces for the schema
- `validate.ts` — hand-rolled validator with field-specific error paths (e.g. `branding.primaryColor`, `features.aggregateEndpoint`)
- `contrast.ts` — pure-math WCAG 2.1 ratio + 3-pair audit
- `load.ts` — fetches `public/practice.json`, validates, applies CSS custom properties to `<html>`, sets document title
- `validate.test.ts` — 13 tests covering valid config, missing/malformed fields, locale rules, HTTPS-only aggregate endpoint, contrast pairs

### i18n (`src/lib/i18n/`)
- `loader.ts` — dynamic JSON imports per locale (Vite generates separate chunks), `t()` with named-param interpolation, locale persistence to localStorage, browser-language detection
- `loader.test.ts` — 5 tests covering interpolation, missing-key behavior, and locale resolution

### Message files (`messages/`)
- `en.json`, `es.json`, `fr.json`, `de.json` — full key parity (CI-enforced)
- App chrome strings, scale labels (FREQ_6 / CHANGE_5 / LIMIT_5), survey item prompts (placeholder until LSHTM permission lands)
- Each locale fully translated for app chrome; placeholder text for the 25 instrument items per `INSTRUMENT-LICENSE.md`

### Canonical practice.json (`public/practice.json`)
- Example Vein Center fixture used by the GH Pages demo + sanity-tested by `npm run check:contrast`

### Validation scripts (`scripts/`)
- `validate-contrast.ts` — runs `auditBranding()` against `public/practice.json`, hard-fails CI on WCAG AA violation
- `validate-translations.ts` — fails on empty strings (non-EN), missing keys, drift; warns on locales outside the validated allowlist

### `package.json` changes
- `npm run check` now runs `check:types` + `check:contrast` + `check:translations` in sequence
- `check:contrast` and `check:translations` are individually invocable

### App / route updates
- `App.svelte` boots the practice config + initial locale before first render; surfaces config errors as a top-level boot error UI
- `LocaleSwitcher.svelte` — `<select>` dropdown on Home/Results; not rendered on Survey (locale lock per SURV-05)
- `Home.svelte`, `Survey.svelte`, `Results.svelte` — all hardcoded strings replaced with `t(key, params?)` calls
- `lib/survey/items.ts` — `SURVEY_ITEMS` now carries `promptKey` + `answerScale` instead of inline text; `answerOptionsForScale()` produces `{value, key}` pairs

## Requirements Satisfied

| REQ-ID | Status |
|---|---|
| BRND-01 (`practice.json` is the only file a fork edits) | ✓ |
| BRND-02 (Zod-equivalent validation with field-specific messages) | ✓ hand-rolled |
| BRND-03 (CSS custom properties at boot) | ✓ `applyBrandingToDocument()` |
| BRND-04 (contrast script as CI hard fail) | ✓ |
| BRND-05 (name, logo, contact, optional reminder cadence) | ✓ schema covers all |
| BRND-06 (`byteworthy.config.yaml` pin) | ⏭ Deferred to Phase 4 (brand-kit scaffolding does this) |
| I18N-01 (paraglide en/es/fr/de) | ✓ — using hand-rolled equivalent (decision in 02-CONTEXT.md) |
| I18N-02 (`allowEmptyMessage: false`) | ✓ via `validate-translations.ts` |
| I18N-03 (CI grep for `": ""`) | ✓ same script |
| I18N-04 (validated-translations-only allowlist) | ✓ same script (warns on others) |
| I18N-05 (locale persisted to localStorage) | ✓ |

## Bundle Math (actual)

| Asset | Raw | Gzip |
|---|---|---|
| index.html | 0.62 KB | 0.37 KB |
| index-*.css | 5.15 KB | 1.56 KB |
| index-*.js (shell) | 59.29 KB | **22.13 KB** |
| en.json chunk | 4.62 KB | 1.56 KB |
| es.json chunk | 5.18 KB | 1.71 KB |
| fr.json chunk | 5.45 KB | 1.74 KB |
| de.json chunk | 4.97 KB | 1.69 KB |
| **Initial load (shell + en)** | **69.68 KB** | **~25.6 KB** |
| **Total app (with all locales loaded)** | **85.28 KB** | **~30.7 KB** |

Research target: 58–73 KB gzip shell. We're at ~26 KB initial. Massive headroom.

## Quality Gates

- ✓ Vitest: 33/33 passing
- ✓ svelte-check: 0 errors, 0 warnings
- ✓ vite build: succeeds, 4 lazy locale chunks generated
- ✓ `npm run check:contrast`: 17.40:1 / 7.17:1 / 7.17:1 — all WCAG AA pass
- ✓ `npm run check:translations`: en/es/fr/de aligned, no empties, no drift

## Notes for Phase 3

- Locale resolution happens once at boot. If a forking practice changes `locale.default`, returning users with a localStorage choice keep their preference. This is correct.
- Brand color custom properties are applied to `document.documentElement.style` — survives route changes and SW updates without re-running.
- The `LocaleSwitcher` is hidden on `/#/survey`; if a returning patient has a draft started in `es` and navigates to Home in `en`, resuming the survey will display Spanish UI — because the survey route reads `session.lockedLocale` from IndexedDB and that takes precedence. Need a UX decision in P3 whether to surface a "this survey is in Spanish" hint.
- All survey item prompts are placeholder. When LSHTM permission lands, replace `messages/{locale}.json` `item.*` keys directly. No code changes needed.

## Cluster lib extraction status (deferred to Phase 5)

- `src/lib/practice-config/` — proven; ready to copy to postsclera/veinquest/stockingfit/veinmap with their tool-specific schema additions
- `src/lib/i18n/loader.ts` — proven; copy verbatim
- `scripts/validate-contrast.ts` and `scripts/validate-translations.ts` — proven; copy verbatim
