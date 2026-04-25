# Phase 2: White-label + i18n - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous)

<domain>
## Phase Boundary

A forking practice edits ONLY `public/practice.json` and deploys a site that renders with their branding (name, logo, primary color, contact). The schema is validated with field-specific human-readable error messages on app boot. All UI strings are loaded from `messages/{locale}.json` files; the app ships en/es/fr/de with empty translations failing the build via a CI grep. Brand color is checked at build time for WCAG AA contrast against the chosen background — CI hard fail on violation.

NO chart, NO PDF, NO reminders, NO PWA, NO aggregate submit. Phase 2 is the cluster template: the four sibling tools (postsclera, veinquest, stockingfit, veinmap) will copy `lib/practice-config/` and `lib/i18n/` from this phase.
</domain>

<decisions>
## Implementation Decisions

### i18n: hand-rolled, not paraglide
- Synthesizer flagged paraglide bare-Vite (non-SvelteKit) as MEDIUM-confidence; setup friction risks Phase 2 timeline
- Hand-rolled solution: ~25 LOC `lib/i18n/loader.ts` with `t(key, locale, params?)` function, simple JSON files in `messages/`
- Bundle savings: ~10–15 KB gzip vs paraglide
- Translator forks: edit JSON files directly — same fork ergonomic paraglide promises
- Re-evaluate at end of P2: if hand-rolled hits friction (interpolation, pluralization), swap to paraglide (no API surface change since `t()` is the only callsite)

### Validation: hand-rolled, not Zod
- Zod is ~13 KB gzip — heavy for a 10-field config file
- Hand-rolled validator (`lib/practice-config/validate.ts`) ~70 LOC with field-specific error messages
- The threat model is "did the deploying clinic typo their `practice.json`" — not arbitrary user input
- Cluster reuse: the same validator pattern serves all 5 tools

### `practice.json` schema (v1)
```jsonc
{
  "$schema": "./practice.schema.json",
  "schemaVersion": 1,
  "practiceName": "Example Vein Center",
  "logoUrl": "./logo.png",            // relative or https
  "primaryContact": {
    "phone": "+1 555 555 5555",
    "email": "info@example-vein.com",
    "websiteUrl": "https://example-vein.com"
  },
  "branding": {
    "primaryColor": "#2a5a8a",
    "primaryTextColor": "#ffffff",
    "backgroundColor": "#ffffff",
    "foregroundColor": "#1a1a1a"
  },
  "locale": {
    "default": "en",
    "available": ["en", "es", "fr", "de"]
  },
  "features": {
    "aggregateSubmit": false,
    "aggregateEndpoint": null
  }
}
```

### Brand-color contrast
- `scripts/validate-contrast.ts` reads `public/practice.json`, computes APCA / WCAG AA against `backgroundColor` and `foregroundColor`, fails build with field-specific error
- Run as `npm run check:contrast` and called from `npm run check`
- WCAG 2.1 AA thresholds: 4.5:1 normal text, 3.0:1 large text + UI components

### CSS custom properties applied at boot
- `lib/practice-config/load.ts` fetches `practice.json`, validates, applies branding via `document.documentElement.style.setProperty('--accent', ...)` etc.
- App.svelte gates first render until config + initial locale are loaded (avoids brand-color FOUC)

### Locale switcher
- `LocaleSwitcher.svelte` component on Home only — disabled (not rendered) on `/#/survey` to enforce SURV-05 locale lock
- Persists choice to `localStorage['vqol.locale']` separately from per-survey lockedLocale
- Defaults to `practice.json.locale.default`, fallback to browser `navigator.language` if listed in `practice.json.locale.available`

### Translation key drift CI gate
- `scripts/validate-translations.ts` — fails on:
  - Empty string in any non-EN file (`": ""`)
  - Key in en that's missing in any other locale
  - Key in another locale that's missing in en (drift)
- Locale allowlist: en, es, fr, de, it, nl, pt — anything else warns and instructs to cite published validation

### What ships in `messages/{locale}.json`
- App-chrome strings (CTAs, labels)
- The 25 question prompts (PLACEHOLDER text moved out of `lib/survey/items.ts` into JSON)
- Answer-scale labels (FREQ_6, CHANGE_5, LIMIT_5)
- Results screen labels

### What the cluster inherits from this phase
- `src/lib/practice-config/` — copy-paste to other 4 tools (each tool customizes the schema to its needs)
- `src/lib/i18n/` — copy-paste verbatim (locale-aware loader, `t()` function, `lockedLocale` pattern)
- `scripts/validate-contrast.ts` — copy-paste verbatim
- `scripts/validate-translations.ts` — copy-paste verbatim

### Out of scope for Phase 2
- Trend chart (P3)
- PDF (P3)
- Reminders + PWA (P3)
- Repo virality / GH Pages CI (P4)
- Aggregate submit (P5)

### Claude's Discretion
All implementation choices for module organization, naming, and TypeScript types within the scope above are at Claude's discretion.

</decisions>

<code_context>
## Existing Code Insights

### From Phase 1
- `src/lib/scoring/` — pure, untouched in P2
- `src/lib/storage/` — adds `lockedLocale` already populated; no schema changes
- `src/lib/survey/items.ts` — placeholder PROMPTS to move into `messages/en.json`
- `src/app.css` — hardcoded brand colors; replace with `var(--accent)` etc. (already done in P1) so P2 just sets the CSS custom properties dynamically
- `src/App.svelte` — minimal hash router; add config-load gate before first route renders

### Reusable from cluster research
- `byteworthy.config.template.yaml` (cached at `.planning/brand-kit-refs/`) defines a `brand_kit_version` field — vqol's `byteworthy.config.yaml` will pin to v1.0.0

</code_context>

<specifics>
## Specific Ideas

- The CI for translation drift must run on the existing locale set (en/es/fr/de) — not on the allowlist (en/es/fr/de/it/nl/pt). The allowlist is for "what may be added by contributors", not "what must exist now".
- `practice.json` example file MUST be the canonical demo (the one that ships on the GH Pages demo) — a vein-clinic-flavored practice that a forking practice can copy-and-edit
- Brand-color contrast script must be runnable locally (`npm run check:contrast`) AND wired into `npm run check`

</specifics>

<deferred>
## Deferred Ideas

- A visual `practice.json` editor / preview tool (v2)
- Auto-generation of accessible accent colors from brand color via OKLCH manipulation (v2)
- Plural rules in i18n (defer until a string actually needs it)

</deferred>
