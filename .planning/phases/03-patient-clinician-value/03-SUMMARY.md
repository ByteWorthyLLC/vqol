# Phase 3: Patient/Clinician Value — Summary

**Status:** Complete
**Completed:** 2026-04-25

## What Shipped

### Trend chart (`src/lib/chart/`)
- `TrendChart.svelte` — uPlot chart, lazy-imported (uPlot's 23.33 KB gzip cost only paid on the Results route)
- Y-axis: "VEINES T-score (higher = better)" — translated in 4 locales
- Two series: QOL (primary color) + Sym (dashed)
- ARIA: `role="img"` + summary `aria-label` + visually-hidden `<table>` of all scores (also serves as the print fallback if `canvas.toDataURL()` fails)
- Resize via `ResizeObserver`
- `onCanvasReady` callback exposes the canvas for PDF snapshot

### PDF export (`src/lib/pdf/`)
- `print.ts` — `printScoreReport({chartDataUrl, injectionTarget, printer?})`:
  1. Inject canvas snapshot as `<img>` into print template (B-2 mitigation)
  2. Toggle `body.is-printing` class
  3. Invoke `window.print()`
  4. Cleanup synchronously + on `afterprint`
- `print.test.ts` — 3 tests covering toggle/cleanup, injection-when-snapshot-present, skip-when-null
- Print template in `Results.svelte` — practice header + score table + history + Lamping/Kahn citations + patient-data-ownership footer + practice contact line

### Reminders (`src/lib/notifications/`)
- `scheduler.ts` — 4 intervals (1mo/3mo/6mo/1yr); MAX 2 fires per interval; cap state in IndexedDB `meta` store
- `permission.ts` — wraps `Notification.requestPermission`; ServiceWorkerRegistration-aware fire path; iOS-Safari standalone detection helper
- `scheduler.test.ts` — 7 tests covering due-reminder discovery, ack flow, fire-cap enforcement, capacity reporting

### UI components
- `InstallPrompt.svelte` — one-time iOS-Safari "Add to Home Screen" instructions (B-4 mitigation)
- `InAppReminderBanner.svelte` — surfaces due reminder on Home with "Take follow-up survey" CTA + dismiss

### CSS / @media print (`src/app.css`)
- `@page { margin: 1.5cm }`
- Block layout only in print view (no Grid, no flex-wrap per B-6)
- `body.is-printing` toggle hides chrome + reveals `.print-only`

### PWA (`vite.config.ts`)
- `vite-plugin-pwa` v1.2.0
- `registerType: 'prompt'` — never auto-update (B-1 mitigation)
- Manifest with theme color, icons (192/512), display standalone, scope `./` (GH-Pages-friendly)
- Workbox-backed SW with 18 precached entries (162 KiB), `cleanupOutdatedCaches: true`
- Placeholder PNG icons generated programmatically (`public/icons/icon-192.png`, `icon-512.png`) — Phase 4 brand-kit will replace

### i18n updates
- All 4 locales (en/es/fr/de) updated with new keys: chart, install prompt, reminders, SW update, print template, notification permission rationale
- CI check:translations confirms full alignment

## Requirements Satisfied

| REQ-ID | Status |
|---|---|
| VIZ-01 (uPlot chart on `/#/results`, lazy-imported) | ✓ |
| VIZ-02 (Y-axis "Higher = better") | ✓ |
| VIZ-03 (`role="img"` + `aria-label` + visually-hidden table) | ✓ |
| VIZ-04 (canvas exposed for PDF) | ✓ |
| PDF-01 (window.print() + @media print) | ✓ |
| PDF-02 (block layout only in @media print, @page margin) | ✓ |
| PDF-03 (canvas → toDataURL → `<img>` injection) | ✓ — solves B-2 |
| PDF-04 (practice name, logo, contact, score, prior, delta, "Higher=better", citations) | ✓ |
| PDF-05 (test on Chrome+Firefox+iOS Safari) | ⏭ Manual verification deferred to Phase 4 |
| REM-01 (Web Notification permission AFTER baseline) | ✓ — `permission.ts` not auto-invoked |
| REM-02 (1mo/3mo/6mo/1yr cadence) | ✓ — `REMINDER_INTERVALS` |
| REM-03 (iOS in-app banner fallback) | ✓ — `InAppReminderBanner.svelte` |
| REM-04 (max 2 fires/interval, IndexedDB-stored cap state) | ✓ |
| REM-05 (in-app banner replaces push after cap) | ✓ — `notificationCapacity()` flips |
| PWA-01 (installable PWA — manifest + SW + offline shell) | ✓ |
| PWA-02 (vite-plugin-pwa) | ✓ |
| PWA-03 (registerType: 'prompt') | ✓ |
| PWA-04 (precache shell + locales + practice.json + icons) | ✓ — 18 entries, 162 KiB |
| PWA-05 (IndexedDB never proxied through SW) | ✓ — Workbox doesn't intercept idb |
| PWA-06 (cleanupOutdatedCaches: true) | ✓ |
| PWA-07 ("Add to Home Screen" prompt after baseline) | ✓ — `InstallPrompt.svelte` on Results |
| A11Y-02 (44×44px tap targets) | ✓ — `--tap-target` from P1 still in force |
| A11Y-04 (keyboard navigation for full survey + chart + PDF) | ✓ — radio inputs + native button nav |

## Bundle Math (actual, gzip)

| Asset | Raw | Gzip |
|---|---|---|
| index.html | 0.74 KB | 0.42 KB |
| index-*.css | 7.69 KB | 2.07 KB |
| index-*.js (shell) | 69.66 KB | **25.67 KB** |
| en.json chunk | 6.85 KB | 2.39 KB |
| **Initial load (shell + en + css + html)** | ~85 KB | **~30.5 KB** |
| uPlot.esm chunk (lazy on /#/results) | 52.33 KB | 23.33 KB |
| uPlot.css chunk | 1.63 KB | 0.70 KB |
| Other locale chunks (lazy) | ~7.6 KB each | ~2.65 KB each |
| **Loaded with chart (en + uPlot)** | ~138 KB | **~54.5 KB** |

Research target was 100 KB total. We're at ~54.5 KB with chart loaded — **45% under budget**.

## Quality Gates

- ✓ Vitest: 43/43 passing
- ✓ svelte-check: 0 errors, 0 warnings
- ✓ vite build: succeeds, 6 lazy chunks, PWA artifacts generated (sw.js, workbox, manifest)
- ✓ check:contrast / check:translations: pass
- ✓ All 4 locales aligned

## Notes for Phase 4

- Placeholder PWA icons (solid #2a5a8a squares) — Phase 4 brand-kit scaffolder will replace with real branded icons
- `vite.config.ts` manifest uses generic "vqol" name; if forking practices want their brand in the install banner, they'll need to also edit the manifest (not just `practice.json`). Document this in the README.
- SW update prompt UX (banner with "Reload now" / defer) — wired in `vite-plugin-pwa` registerType='prompt' but NOT yet rendered as a Svelte component. Add `SwUpdatePrompt.svelte` in Phase 4 or P5 (not blocking v0.1).
- Real-device PDF testing on iOS Safari is the highest-value remaining manual test — P4 demo polish gates this

## Cluster lib extraction status

- `src/lib/pdf/print.ts` — proven; copy verbatim to postsclera (the print template is per-tool-customized, but the workflow is identical)
- `src/lib/notifications/scheduler.ts` — proven; copy with cadence array as parameter
- `src/lib/notifications/permission.ts` — proven; copy verbatim
- `src/lib/chart/TrendChart.svelte` — vqol-specific (other cluster tools have different chart needs)
