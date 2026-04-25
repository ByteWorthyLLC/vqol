# Phase 3: Patient/Clinician Value - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Auto-generated (autonomous)

<domain>
## Phase Boundary

A patient who completes a baseline survey can:
1. See a longitudinal trend chart of their score history (uPlot, lazy-loaded; "Higher = better" Y-axis; screen-reader fallback table)
2. Export a practice-branded one-page PDF for their clinician (window.print() + @media print CSS + canvas.toDataURL injection so the chart prints on iOS Safari)
3. Receive scheduled local reminders at 1mo/3mo/6mo/1yr post-baseline (Web Notifications API)
4. Get a graceful iOS in-app banner fallback when Web Notifications are unsupported
5. Be prompted to install the PWA after baseline (mitigates iOS 7-day IndexedDB eviction)

NO virality scaffolding, NO aggregate submit. Phase 3 is the "patient gets real value" layer.
</domain>

<decisions>
## Implementation Decisions

### Chart: uPlot, lazy-loaded
- Bundle: ~47 KB gzip — MUST be loaded only on the Results route, never in the shell
- Mount via dynamic `import('uplot')` inside `Chart.svelte` `onMount`
- Render `<canvas>` with `aria-label`, `role="img"`, plus visually-hidden `<table>` of score history as a screen-reader fallback (also serves as the print fallback if canvas-to-image fails)
- Y-axis labeled "Higher = better — VEINES T-score" via paraglide key
- X-axis: dates from `score.calculatedAt`
- Two series: QOL (primary color) + Sym (secondary color, hashed line)
- `canvas.toDataURL()` exposed via a binding so the PDF module can snapshot it before window.print()

### PDF: window.print() + @media print + canvas-to-img injection
- ZERO bundle cost (no jsPDF, no pdf-lib)
- `lib/pdf/print.ts` — `printScoreReport(snapshot: string | null)` workflow:
  1. Add `body.printing` class (CSS toggles `@media print`-style block layout)
  2. Inject `<img class="print-chart" src={snapshot}>` into the print template if snapshot provided (canvas-to-img — solves B-2 iOS Safari silent fail)
  3. Call `window.print()`
  4. After print event ends (or 1s timeout), remove class + injected img
- `@media print` rules in `app.css`:
  - `@page { margin: 1.5cm }`
  - Hide header/footer/nav/buttons (`.no-print`)
  - Show `.print-only` block: practice name, contact, score table, chart image, citations to Lamping 2003 + Kahn 2006, "patient retains data ownership" footer
  - Block layout only — no Grid, no flex-wrap (per B-6)

### Notifications + reminders
- `lib/notifications/permission.ts` — wraps `Notification.requestPermission()`; only invoked AFTER first baseline completion (REM-01)
- `lib/notifications/scheduler.ts`:
  - Computes due intervals from baseline `completedAt`: 1mo (30d), 3mo (90d), 6mo (180d), 12mo (365d)
  - Stores fire-counts and ack state per interval in `meta` store (`notification_cap_v1`/`v3`/`v6`/`v12`)
  - Each interval capped at MAX 2 fires (E-4: reminder fatigue prevention)
  - On app open: check overdue intervals, fire any unfired-and-uncapped, increment counter
- Web Notifications path (when `Notification.permission === 'granted'`)
- iOS in-app banner fallback (`InAppReminderBanner.svelte`) when permission denied OR API absent OR cap reached — appears at top of Home for the overdue interval, dismissable, dismissal sets `acknowledged: true`

### iOS install prompt (B-4 7-day eviction mitigation)
- After baseline survey completion, Results screen shows a one-time `InstallPrompt.svelte` if:
  - Browser is iOS Safari (UA detection — `/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.matchMedia('(display-mode: standalone)').matches`)
  - User hasn't been prompted before (meta key `ios_install_prompt_shown`)
- Shows specific instructions ("Tap Share → Add to Home Screen") with a screenshot reference
- Dismissable; remembers dismissal forever

### PWA via vite-plugin-pwa
- `registerType: 'prompt'` (NOT autoUpdate — B-1 mitigation: prevents mid-survey SW kill)
- `injectManifest` strategy (more control than `generateSW`)
- Custom service worker at `src/sw.ts` — pre-cache app shell + locale chunks + practice.json + icons; never proxy IndexedDB
- Manifest in `vite.config.ts`:
  - name: read from practice.json at build time? No — practice.json is loaded at RUNTIME for fork ergonomics, so manifest uses generic "vqol" with the deploying practice expected to override `public/manifest.webmanifest` if they want their own brand
  - theme_color, background_color matching default brand
  - 192px + 512px icons (placeholder SVG converted to PNG; fork can replace)
- `cleanupOutdatedCaches: true`

### Update prompt UX (B-1 enforcement)
- When SW detects new version available (registerType: 'prompt'), show a top-of-page banner: "A new version is ready — finish your survey first, then refresh."
- Crucially: NEVER refresh or reload while `survey/Survey.svelte` route is active — the user is in the middle of a survey
- The banner only offers "Reload now" when route !== 'survey'

### What ships in `messages/{locale}.json` additions (P3)
- All 4 locales get the new keys: chart axis labels, PDF "Share with provider" / "Generated by vqol", install prompt copy, notification permission rationale, reminder banner copy

### Out of scope for Phase 3
- Repo virality / GH Pages / README (P4)
- Aggregate submit (P5)
- Cluster lib extraction (P5)

### Claude's Discretion
All implementation choices for module organization, component decomposition, and TypeScript types within the scope above are at Claude's discretion.

</decisions>

<code_context>
## Existing Code Insights

- `src/lib/storage/db.ts` — already has `meta` store for `notification_cap_*` keys; just write to it
- `src/lib/i18n/loader.ts` — handles all 4 locales; new keys appended to en/es/fr/de
- `src/App.svelte` — adds InstallPrompt + InAppReminderBanner via Home; SW update banner is App-level

## Cluster reuse
- `lib/pdf/print.ts` — copy verbatim to postsclera (only differs in print template content)
- `lib/notifications/scheduler.ts` — copy with cadence array as parameter

</code_context>

<specifics>
## Specific Ideas

- The chart canvas-to-img conversion MUST happen synchronously before `window.print()` — async timing causes iOS Safari to print a blank chart
- Print template MUST cite Lamping 2003 + Kahn 2006 — clinicians who don't know what VEINES is need the references
- Install prompt copy must be specific to iOS Safari ("Tap Share button → Scroll → Add to Home Screen") — generic "install this app" doesn't work on iOS
- SW update prompt MUST defer if user is mid-survey

</specifics>

<deferred>
## Deferred Ideas

- A "wipe everything" UI button (db.ts already has wipeAll; UI in P5 alongside aggregate submit toggle)
- Calendar export (.ics) of reminder schedule (v2)
- Push notifications via Web Push protocol (would need backend; v2)

</deferred>
