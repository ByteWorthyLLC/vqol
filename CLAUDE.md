<!-- GSD:project-start source:PROJECT.md -->
## Project

**vqol**

A patient-owned VEINES-QOL/Sym tracker delivered as a static, installable PWA — the first open-source patient-facing PRO instrument tracker for vein/vascular care. Patients self-administer the validated quality-of-life survey at baseline, 1mo, 6mo, and 1yr after vein/vascular treatment, see their own improvement over time, and export their score history for clinician follow-ups. Vein practices fork the repo, drop in a `practice.json` with their branding, and deploy as a white-label patient tool that doubles as an outcomes-data engine.

Lives at `github.com/ByteWorthyLLC/vqol`. MIT-licensed. Built to spread.

**Core Value:** A patient-facing, free, validated PRO instrument tracker that produces a real outcomes story for the practice — without requiring engineering, hosting, or per-response licensing fees that closed PRO platforms charge. The repo is the product: every star, fork, and deploy is distribution.

### Constraints

- **Tech stack**: Static PWA only — Vite + Preact + IndexedDB + chart.js (or uPlot) + jsPDF. ~1200–1800 LOC budget. Reason: fork-and-host requires zero backend; everything must run from a static host.
- **Hosting**: GitHub Pages or Cloudflare Pages — no server, no DB, no env secrets. Reason: "deployable in an afternoon by a vein practice manager" is the user-facing pitch.
- **Privacy**: All patient data local-only by default. No telemetry. No analytics. Anonymous aggregate submission is opt-in, off by default. Reason: patient-data-ownership is part of the differentiation story; one accidental leak kills the brand.
- **Licensing**: VEINES-QOL/Sym instrument license must be confirmed permissive for OSS patient-facing distribution before v1.0 release. Reason: the entire repo's value depends on bundling the validated instrument.
- **Accessibility**: Patient audience skews older (vein disease prevalence rises with age). UI must meet WCAG AA contrast, support large tap targets, and work with screen readers. Reason: real-world patient mix.
- **Effort budget**: 1–2 weeks to v0.1 deployable at the author's clinic. Reason: this is the lowest-risk tool in the cluster and must demonstrate the white-label pattern fast.
- **Repo home**: `github.com/ByteWorthyLLC/vqol` (public). Reason: ByteWorthyLLC is the studio brand for OSS work; signals "real software shop, not abandoned weekend project" and channels traffic to byteworthy.io.
- **License**: MIT. Reason: max permissive — the moat is operator context + brand, not source-code lockup. Practices and competitors can both fork; we win on continued shipping cadence.
- **Web commit signoff**: ByteWorthyLLC org enforces signed commits. All commits and releases must be signed.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Installation
# Scaffold
# Core runtime
# i18n — paraglide
# Follow prompts: creates project.inlang/ and messages/{en,es,fr,de}.json
# PWA
# Dev / quality
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
## Bundle Budget Reconciliation
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
## Routing
- `svelte-spa-router` — hash routing, works on GH Pages without 404 fallback, Svelte 5 compatible
- Alternative: `@mateothegreat/svelte5-router` — newer Svelte 5-native but less mature
## Web Notifications + Scheduled Reminders
- Push notifications: available since iOS 16.4 only when PWA is added to Home Screen
- Periodic Background Sync: NOT supported on iOS, no roadmap
- Background Sync: NOT supported on iOS, no roadmap
- Background Fetch: NOT supported on iOS, no roadmap
## i18n Fork Ergonomics
## PWA Service Worker Strategy
## CI/CD Workflow (GitHub Actions)
## Repo Virality Scaffolding
## Cluster-Shareable Utilities
| Module | Path | Shared by |
|--------|------|-----------|
| Practice config loader | `src/lib/practice-config.ts` | All 5 tools — reads `practice.json`, validates schema, exports typed config |
| PDF/print export | `src/lib/pdf-export.ts` | vqol, postsclera — applies `.print-view` class, calls `window.print()`, resets |
| i18n bootstrap | `src/lib/i18n.ts` | All 5 tools — wraps paraglide languageTag() detection and persistence to localStorage |
| IndexedDB schema | `src/lib/db.ts` | vqol, postsclera, veinmap — idb wrapper with typed stores |
| Notification scheduler | `src/lib/reminders.ts` | vqol, postsclera — on-open reminder check logic |
## Version Compatibility
| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| svelte@5 | ^5.55.x | vite@6, @sveltejs/vite-plugin-svelte@5 | Do NOT use vite@5 — Vite 6 is current |
| vite-plugin-pwa@1 | ^1.2.0 | vite@6 | vite-plugin-pwa 0.x was for Vite 4/5; use 1.x |
| @inlang/paraglide-js | ^1.x | Svelte 5 + Vite | SvelteKit adapter not needed for SPA; use `@inlang/paraglide-js` directly |
| idb | ^8.x | All modern browsers | idb 7.x also fine; 8.x adds TypeScript improvements |
| uPlot | ^1.6.x | All modern browsers | No React/Svelte bindings needed — mount to `div` via `onMount` |
| vitest | ^2.x | vite@6 | vitest 1.x incompatible with Vite 6 |
## Accessibility Notes
- uPlot renders to `<canvas>`. Add `aria-label` with current score values and `role="img"` to the container. Provide a visually-hidden `<table>` of score history as accessible fallback (also useful for print export).
- Paraglide does not handle locale-aware date formatting — use `Intl.DateTimeFormat` (built-in, zero-bundle cost) for score dates.
- Tap targets: minimum 44×44px per WCAG 2.2 (older patient audience). Use CSS `min-height: 44px; min-width: 44px` on all survey answer buttons.
- Color contrast: CSS custom properties from `practice.json` must be validated at deploy time. Add a CI lint step that checks `practice.json` color values meet WCAG AA (4.5:1 for text). Use `color-contrast` npm package (~1KB) in a test or build script — do not ship it.
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
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
