# Stack Research

**Domain:** Static PWA — patient-facing PRO instrument tracker (VEINES-QOL/Sym)
**Researched:** 2026-04-25
**Confidence:** MEDIUM-HIGH (framework/PWA/i18n HIGH; PDF/bundle-exact MEDIUM due to WebFetch restriction)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Svelte 5 | ^5.55.x | UI framework | Compiler-based: ~2-3KB runtime gzip vs Preact's ~4KB. No virtual DOM overhead. Runes reactivity is simpler than hooks for a ~1500 LOC budget. Official Svelte CLI has paraglide integration built-in. |
| Vite | ^6.x | Build tool | Only viable choice for static-PWA + GH Pages. Astro adds SSR complexity we don't need; raw Rollup requires manual plugin assembly. Vite has first-class Svelte plugin and vite-plugin-pwa. |
| TypeScript | ^5.7.x | Type safety | Mandatory for a forked codebase — clinic operators who aren't devs will break things; TS catches errors at build time before they deploy. `svelte-ts` template from `npm create vite`. |
| vite-plugin-pwa | ^1.2.0 | PWA + service worker | Zero-config offline with Workbox under the hood. Handles app-shell caching, manifest generation, and installability. Framework-agnostic — works with Svelte. |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Size (gzip est.) |
|---------|---------|---------|-------------|-----------------|
| @inlang/paraglide-js | ^1.x | i18n | Always — 4 languages required, needs fork-ergonomics for translators | ~5KB for 4 locales |
| idb | ^8.x | IndexedDB wrapper | Always — thinnest possible wrapper, 3KB gzip. Use for score storage, settings, session state | ~3KB |
| uPlot | ^1.6.x | Trend chart | Always — 47KB gzip vs Chart.js 254KB. Renders canvas-based time-series with lines. Sufficient for 4-5 datapoints per score type. | ~47KB |
| @csstools/normalize.css | ^12.x | CSS reset | Always — modern, small, sets WCAG-friendly baseline | <1KB |

### PDF Export Decision: window.print() + CSS @media print

**Recommendation: CSS print + `window.print()`, NOT jsPDF or pdf-lib.**

Rationale:
- jsPDF latest (v4.2.1) is **229.8KB gzip** — this alone blows the entire <100KB app-shell budget. This is disqualifying.
- pdf-lib v1.17.1 is ~215KB minified (~80-100KB gzip) — also exceeds budget for PDF alone.
- `window.print()` is zero-bundle-cost. Browser handles rendering. Score report is a styled HTML view with `@media print` rules that produce a clinician-friendly A4/Letter PDF on any device.
- Limitation: `window.print()` triggers a dialog; not fully programmatic. For a "share with doctor" flow this is fine — the patient taps "Export PDF", the OS print dialog opens, they save as PDF or print. iOS Safari supports this.
- **Cluster pattern**: Use `lib/pdf-export` as a thin module that just applies a print-ready CSS class to a `<PrintReport>` component and calls `window.print()`. All 5 cluster tools share this pattern.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| @sveltejs/vite-plugin-svelte | ^5.x | Svelte compiler for Vite | Installed automatically via `npm create vite -- --template svelte-ts` |
| eslint + eslint-plugin-svelte | ^9.x / ^3.x | Linting | Use flat config (eslint.config.js). svelte-eslint-parser required. |
| prettier + prettier-plugin-svelte | ^3.x / ^3.x | Formatting | Standard Svelte formatter. |
| treosh/lighthouse-ci-action | latest | Lighthouse audit in CI | Runs against built + deployed preview. Threshold: perf≥95, a11y≥95, best-practices≥90. |
| vitest | ^2.x | Unit tests | Svelte-native test runner via Vite config. Tests for scoring engine, config loader, idb adapter. |
| @vitest/browser | ^2.x | Component tests | Optional — use for chart rendering smoke tests only |

---

## Installation

```bash
# Scaffold
npm create vite@latest vqol -- --template svelte-ts

# Core runtime
npm install idb uplot

# i18n — paraglide
npx @inlang/paraglide-js init
# Follow prompts: creates project.inlang/ and messages/{en,es,fr,de}.json

# PWA
npm install -D vite-plugin-pwa

# Dev / quality
npm install -D eslint eslint-plugin-svelte prettier prettier-plugin-svelte vitest @vitest/browser
```

No jsPDF. No pdf-lib. No react-i18next. No Chart.js.

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Svelte 5 | Preact 10 | Preact needs react-compat shim for ecosystem; Svelte 5 compiles away framework overhead; paraglide has official Svelte CLI integration; real app sizes land ~same but Svelte has no runtime virtual DOM |
| Svelte 5 | SolidJS | Solid is excellent but smaller ecosystem, fewer i18n options with fork ergonomics for non-devs, no official paraglide integration |
| Svelte 5 | Vanilla JS | LOC budget savings don't materialize — reactive state management by hand adds 200-400 LOC vs Svelte runes; WCAG focus management is harder by hand |
| vite-plugin-pwa | Hand-rolled SW | vite-plugin-pwa wraps Workbox; hand-rolled requires understanding Workbox API directly; no benefit at this scale |
| uPlot | Chart.js | Chart.js 254KB gzip vs uPlot 47KB. Chart.js canvas a11y requires manual ARIA — same manual work either way. uPlot is faster and smaller. |
| uPlot | Hand-rolled SVG | Hand-rolled SVG is 0KB but requires tooltip, resize, and axis math that easily costs 150-200 LOC. uPlot at 47KB pays for itself. |
| CSS @media print | jsPDF | jsPDF 229.8KB gzip blows the entire budget. |
| CSS @media print | pdf-lib | pdf-lib ~80-100KB gzip; still expensive for a single-use export; no benefit over print dialog for a 1-page score report. |
| idb | Dexie.js | Dexie is 26KB gzip vs idb's 3KB. Dexie's query power is wasted on 3 object stores with simple CRUD. |
| idb | Raw IndexedDB | Raw IDB requires verbose transaction boilerplate for every read/write; adds 50-100 LOC; idb's 3KB is worth it |
| paraglide | i18next | i18next 22KB+ runtime; ships all keys even unused ones; fork ergonomics worse (JSON format is same, but runtime overhead is higher) |
| paraglide | lingui | Lingui requires macro compilation step; good DX for devs but harder for clinic translators who just edit JSON files |
| paraglide | Hand-rolled | Hand-rolled i18n for 4 locales is feasible at this scale (~100 LOC) but loses type safety and Fink translation editor support |
| Vite | Astro | Astro adds SSG/MPA complexity; this is a fully client-side SPA, Astro's island architecture is wasted overhead |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| jsPDF (any version) | v4.2.1 is 229.8KB gzip — blows entire app-shell budget alone | CSS @media print + window.print() |
| pdf-lib | ~80-100KB gzip for what amounts to a dialog trigger; maintenance has stalled (no release since 2021) | CSS @media print + window.print() |
| React / react-dom | 47KB gzip baseline before any app code; defeats LOC + Lighthouse budget | Svelte 5 |
| Chart.js | 254KB gzip; canvas-only with manual ARIA; overkill for 4-5 trend datapoints | uPlot |
| Dexie.js | 26KB gzip for query power not needed on 3 simple stores | idb |
| i18next / react-i18next | 22KB+ runtime; ships unused keys; fork editors must know JSON namespace conventions | paraglide |
| SvelteKit | Routing, SSR, adapter machinery not needed for a client-only SPA on GH Pages; adds 40-100KB to build output and `__SVELTEKIT_DATA__` script injection complexity | Svelte 5 + svelte-spa-router (hash routing) |
| semantic-release | Over-engineered for a single-repo OSS project; requires commitizen + commitlint hooks, adds friction for clinic operator contributors | Manual CHANGELOG.md following Keep a Changelog + GitHub Releases UI |
| Periodic Background Sync | Not supported on iOS Safari (as of 2026) | app-open scheduling (see Notifications section) |
| Background Fetch API | Not supported on iOS Safari (as of 2026) | Standard fetch on app-open |
| Tailwind CSS | Purged Tailwind adds ~5-8KB gzip; fine in isolation but eats budget shared with uPlot; vanilla CSS with CSS custom properties from practice.json is simpler and zero-dep | Vanilla CSS + CSS custom properties |

---

## Bundle Budget Reconciliation

Target: <100KB gzip total app shell (HTML + JS + CSS, excluding uPlot).

| Chunk | Est. gzip | Notes |
|-------|-----------|-------|
| Svelte 5 runtime | ~3KB | Compiled away aggressively |
| App code (scoring engine, components, router) | ~25-35KB | ~1500 LOC TypeScript compiled |
| idb | ~3KB | |
| paraglide runtime + 4 locale messages | ~10-15KB | Tree-shaken per page |
| CSS (app + print styles) | ~5KB | |
| vite-plugin-pwa service worker | ~10KB | Workbox runtime |
| Web manifest + icons | ~2KB | |
| **App shell subtotal** | **~58-73KB** | Comfortably under 100KB |
| uPlot (lazy-loaded on chart view) | ~47KB | Load on chart route only — not in initial shell |
| **Full app loaded** | **~105-120KB** | Acceptable; shell is fast, chart defers |

uPlot must be lazy-loaded (dynamic `import()`) on the trend chart route. Do not include in initial app shell chunk.

---

## Routing

Svelte 5 without SvelteKit needs a router. Use **hash-based routing**:

- `svelte-spa-router` — hash routing, works on GH Pages without 404 fallback, Svelte 5 compatible
- Alternative: `@mateothegreat/svelte5-router` — newer Svelte 5-native but less mature

**Use `svelte-spa-router`**. GH Pages serves `index.html` only; hash routing (`/#/survey`) requires no server-side routing config.

---

## Web Notifications + Scheduled Reminders

**iOS Safari reality (2026):**
- Push notifications: available since iOS 16.4 only when PWA is added to Home Screen
- Periodic Background Sync: NOT supported on iOS, no roadmap
- Background Sync: NOT supported on iOS, no roadmap
- Background Fetch: NOT supported on iOS, no roadmap

**Pattern to use:**

1. On first survey completion, store `baseline_date` in IndexedDB
2. On every app open, check elapsed time vs reminder schedule (1mo, 3mo, 6mo, 1yr)
3. If in a reminder window and user hasn't completed that interval: show in-app prompt immediately
4. If `Notification.permission === 'granted'` (granted when installed to Home Screen on iOS), schedule a `setTimeout`/`setInterval` to fire `new Notification()` for the current session only
5. Use `registration.showNotification()` from the service worker for Android (which supports persistent notifications)

**Do NOT attempt Periodic Background Sync** — it fails silently on iOS and degrades to never notifying. The clinician PDF export and the reminder prompt on app-open are the reliable notification paths.

This is explicitly a limitation to document in README: "iOS reminders require the app to be installed to your Home Screen and opened periodically."

---

## i18n Fork Ergonomics

Paraglide stores translations as `messages/{locale}.json`. Each JSON key is a typed function call after compilation:

```
// messages/en.json
{ "survey_intro": "Please answer all questions honestly." }

// in component
import * as m from '$lib/paraglide/messages'
m.survey_intro()  // type-safe, tree-shaken
```

Fork workflow for translators:
1. Translator opens `messages/de.json` directly (plain JSON, no tooling required)
2. They add/update string values
3. PR → CI runs `paraglide compile` → type errors surface missing keys
4. Merge

The Fink visual editor (inlang.com) also works if the clinic has a non-developer translator who wants a GUI. This is the best fork ergonomic available in 2026 without a SaaS translation platform.

**Validated translations only at v1**: en, es, fr, de (per published VEINES-QOL/Sym validation papers). Mark `messages/*.json` as the canonical source of truth with a note that adding a locale requires both translation strings AND instrument validation citation.

---

## PWA Service Worker Strategy

Use `vite-plugin-pwa` with `strategies: 'injectManifest'` (not the default `generateSW`).

Reason: The app needs to intercept notifications from the service worker for Android, and future anonymous aggregate submit will need custom fetch routing. `injectManifest` lets us write a custom `src/sw.ts` while still auto-injecting the Workbox precache manifest.

```ts
// vite.config.ts
VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src',
  filename: 'sw.ts',
  registerType: 'autoUpdate',
  manifest: {
    name: 'VEINES-QOL Tracker',
    short_name: 'VQoL',
    theme_color: '#000000', // overridden by practice.json at runtime
    display: 'standalone',
    start_url: '.',
    icons: [/* 192, 512, maskable */]
  }
})
```

App shell caching strategy: `CacheFirst` for all pre-cached assets (revisioned URLs). No network-first needed — this is entirely offline-capable by design.

---

## CI/CD Workflow (GitHub Actions)

Two workflow files:

**`.github/workflows/ci.yml`** — runs on every PR:
```yaml
name: CI
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run check          # tsc via svelte-check
      - run: npm run test:unit
      - run: npm run build
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v12
        with:
          uploadArtifacts: true
          temporaryPublicStorage: true
          configPath: .lighthouserc.json
```

**`.github/workflows/deploy.yml`** — runs on push to `main`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22', cache: 'npm' }
      - run: npm ci && npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
        id: deployment
```

Use the official `actions/deploy-pages@v4` (GitHub-maintained) not `peaceiris/actions-gh-pages`. The official action uses the Pages API (no `gh-pages` branch required) and is the 2025-2026 standard.

Lighthouse config (`.lighthouserc.json`):
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.95}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["warn", {"minScore": 0.90}],
        "categories:pwa": ["warn", {"minScore": 0.90}]
      }
    }
  }
}
```

---

## Repo Virality Scaffolding

**Contributor Covenant:** Use **v3.0** (released July 2025 — current as of research date). Earlier recommendation of v2.1 in PROJECT.md is stale. v3.0 text is at contributor-covenant.org.

**Changelog:** Manual `CHANGELOG.md` following [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. Do NOT use semantic-release or changesets.

Rationale: This is a single-package OSS project with low commit velocity. semantic-release's commitlint enforcement adds friction for clinic operators and casual contributors. changesets is monorepo-oriented. A hand-maintained CHANGELOG with conventional format signals "mature maintainer" more than automation for a <v1.0 project, and the 1-2 week sprint to v0.1 doesn't warrant CI release tooling.

When the cluster grows to 5 repos under ByteWorthyLLC, revisit changesets for cross-repo coordination.

**Badge stack** (concise — 5-7 badges max, all on one line):

```markdown
![Build](https://github.com/ByteWorthyLLC/vqol/actions/workflows/ci.yml/badge.svg)
![Lighthouse](https://img.shields.io/badge/Lighthouse-95%2B-brightgreen?logo=lighthouse)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![i18n: 4 languages](https://img.shields.io/badge/i18n-4%20languages-informational)
```

Omit: version badge (pre-1.0 and meaningless), npm badge (not a library), stars badge (zero at launch). Add a GitHub release version badge once v0.1.0 is tagged.

---

## Cluster-Shareable Utilities

Since `postsclera`, `veinquest`, `stockingfit`, and `veinmap` follow the same white-label pattern, extract these into cluster-shared modules **within the vqol repo first** then copy-forward:

| Module | Path | Shared by |
|--------|------|-----------|
| Practice config loader | `src/lib/practice-config.ts` | All 5 tools — reads `practice.json`, validates schema, exports typed config |
| PDF/print export | `src/lib/pdf-export.ts` | vqol, postsclera — applies `.print-view` class, calls `window.print()`, resets |
| i18n bootstrap | `src/lib/i18n.ts` | All 5 tools — wraps paraglide languageTag() detection and persistence to localStorage |
| IndexedDB schema | `src/lib/db.ts` | vqol, postsclera, veinmap — idb wrapper with typed stores |
| Notification scheduler | `src/lib/reminders.ts` | vqol, postsclera — on-open reminder check logic |

These are copy-forward (no monorepo for now). When 3+ tools share identical code, extract to a private `@byteworthy/vein-utils` npm package. Not worth the overhead at v0.1.

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| svelte@5 | ^5.55.x | vite@6, @sveltejs/vite-plugin-svelte@5 | Do NOT use vite@5 — Vite 6 is current |
| vite-plugin-pwa@1 | ^1.2.0 | vite@6 | vite-plugin-pwa 0.x was for Vite 4/5; use 1.x |
| @inlang/paraglide-js | ^1.x | Svelte 5 + Vite | SvelteKit adapter not needed for SPA; use `@inlang/paraglide-js` directly |
| idb | ^8.x | All modern browsers | idb 7.x also fine; 8.x adds TypeScript improvements |
| uPlot | ^1.6.x | All modern browsers | No React/Svelte bindings needed — mount to `div` via `onMount` |
| vitest | ^2.x | vite@6 | vitest 1.x incompatible with Vite 6 |

---

## Accessibility Notes

- uPlot renders to `<canvas>`. Add `aria-label` with current score values and `role="img"` to the container. Provide a visually-hidden `<table>` of score history as accessible fallback (also useful for print export).
- Paraglide does not handle locale-aware date formatting — use `Intl.DateTimeFormat` (built-in, zero-bundle cost) for score dates.
- Tap targets: minimum 44×44px per WCAG 2.2 (older patient audience). Use CSS `min-height: 44px; min-width: 44px` on all survey answer buttons.
- Color contrast: CSS custom properties from `practice.json` must be validated at deploy time. Add a CI lint step that checks `practice.json` color values meet WCAG AA (4.5:1 for text). Use `color-contrast` npm package (~1KB) in a test or build script — do not ship it.

---

## Sources

- WebSearch: Svelte 5 bundle size comparison — MEDIUM confidence (multiple sources agree ~2-3KB runtime gzip)
- WebSearch: vite-plugin-pwa v1.2.0 latest — HIGH confidence (npm page)
- WebSearch: Svelte 5 v5.55.x latest — HIGH confidence (npm + GitHub releases)
- WebSearch: paraglide-js compiler-based i18n, 70% smaller bundles — HIGH confidence (official benchmark page + independent comparison articles)
- WebSearch: jsPDF v4.2.1 = 229.8KB gzip — HIGH confidence (bundlephobia page referenced)
- WebSearch: idb ~3KB vs Dexie ~26KB gzip — HIGH confidence (multiple sources agree)
- WebSearch: uPlot ~47KB vs Chart.js ~254KB — HIGH confidence (npm + GitHub README)
- WebSearch: iOS Safari no Periodic Background Sync (2026) — HIGH confidence (multiple 2026 PWA limitation sources)
- WebSearch: iOS Safari push notifications require Home Screen install (since iOS 16.4) — HIGH confidence
- WebSearch: Contributor Covenant v3.0 released July 2025 — HIGH confidence (EthicalSource announcement)
- WebSearch: `actions/deploy-pages@v4` official GitHub Pages action — HIGH confidence (GitHub Marketplace)
- WebSearch: window.print() + CSS @media print — standard approach; jsPDF iOS PWA limitations confirmed via GitHub issues — HIGH confidence
- WebSearch: Svelte 5 pure Vite (no SvelteKit) via `npm create vite -- --template svelte-ts` — HIGH confidence
- WebSearch: paraglide official SvelteKit integration; Vite-only usage also supported via `@inlang/paraglide-js` directly — MEDIUM confidence (SvelteKit docs confirmed; bare Vite usage less documented)

---

*Stack research for: vqol — static PWA VEINES-QOL/Sym tracker*
*Researched: 2026-04-25*
