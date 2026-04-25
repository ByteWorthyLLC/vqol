# Architecture Research

**Domain:** Static patient-facing PWA — validated questionnaire tracker with local persistence, multi-language, white-label, PDF export
**Researched:** 2026-04-25
**Confidence:** HIGH

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BROWSER (static PWA)                           │
├───────────────────────┬─────────────────────────────────────────────────┤
│     SHELL LAYER       │             FEATURE MODULES                     │
│  app/                 │                                                 │
│  ┌─────────────────┐  │  ┌─────────┐  ┌────────┐  ┌──────┐  ┌───────┐ │
│  │  Preact root    │  │  │ survey/ │  │scoring/│  │chart/│  │  pdf/ │ │
│  │  Router (wouter)│──┼─▶│ screens │  │ engine │  │trend │  │export │ │
│  │  i18n provider  │  │  └────┬────┘  └───┬────┘  └──┬───┘  └───┬───┘ │
│  │  brand provider │  │       │            │           │           │    │
│  └─────────────────┘  │       └────────────┼───────────┘           │    │
├───────────────────────┴────────────────────┼───────────────────────┼────┤
│                       CROSS-CUTTING         │                       │    │
│  ┌────────────┐  ┌────────────┐  ┌─────────▼──────┐  ┌────────────▼──┐ │
│  │notifications│  │  i18n/    │  │   storage/     │  │  branding/    │ │
│  │  scheduler  │  │  loader   │  │  IndexedDB     │  │practice.json  │ │
│  └────────────┘  └────────────┘  └────────────────┘  └───────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                        SERVICE WORKER                                   │
│  precache app shell │ offline fallback │ notification dispatch         │
├─────────────────────────────────────────────────────────────────────────┤
│                    CLUSTER-SHARED lib/ BOUNDARY                         │
│  lib/practice-config │ lib/i18n-loader │ lib/pdf-export │ lib/aggregate│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

| Module | Single Responsibility | Inputs | Outputs | Talks To |
|---|---|---|---|---|
| `app/` | Root, router, providers | URL hash, `practice.json` | Rendered screen | survey/, chart/, pdf/ |
| `survey/` | Render 25-item VEINES form, collect answers | i18n strings, prior-session signal | Answer object per question | scoring/ (on submit) |
| `scoring/` | Pure VEINES-QOL/Sym algorithm | Answers array | `{ qol: number, sym: number }` | storage/ (result), chart/ (history) |
| `storage/` | IndexedDB CRUD for sessions + scores | Session data | `Session[]`, `Score[]` | survey/ (resume), chart/ (trend data) |
| `chart/` | Longitudinal trend line (uPlot) | `Score[]` ordered by date | Rendered chart | pdf/ (snapshot) |
| `pdf/` | Clinician-ready PDF via jsPDF | `Score[]`, brand config, i18n | Triggers browser download | chart/ (canvas snapshot) |
| `notifications/` | Schedule Web Notifications at 1mo/3mo/6mo/1yr | Baseline session date | Notification registration | storage/ (read baseline date) |
| `i18n/` | Load translation JSON, expose `t()` | `navigator.language`, practice override | `t(key)` function | All UI modules |
| `branding/` | Load + validate `practice.json`, expose theme tokens | `/practice.json` fetch | Brand signal (name, logo, colors, flags) | app/ (CSS vars), pdf/ (header) |
| `aggregate/` | Opt-in anonymous score POST | Score + practice endpoint | HTTP POST | storage/ (read scores), practice.json (endpoint + flag) |

**Invariant ownership:**
- `scoring/` is a pure function — no side effects, no imports from other app modules. Import direction is strictly one-way: `survey/` calls `scoring/`, never the reverse.
- `storage/` is the only module that touches IndexedDB. All other modules call `storage/` — no module opens its own DB connection.
- `branding/` is the only module that reads `practice.json`. CSS custom properties are applied once at boot; downstream modules consume signals only.

---

## Data Flow

### Answer → Score → Chart → PDF

```
Patient taps answer
    │
    ▼
survey/AnswerCard
    │  updates signal: answers[questionIndex] = value
    ▼
survey/SurveyScreen (on "Submit")
    │  calls scoring/calculateVeinesScore(answers)
    ▼
scoring/calculateVeinesScore()   ← PURE FUNCTION, no I/O
    │  returns { qol: number, sym: number, answeredAt: ISO8601 }
    ▼
storage/saveSession(session)
    │  writes Session + Score to IndexedDB via Dexie
    ▼
app/ navigates to /results
    │
    ├──▶ chart/TrendChart
    │        reads storage/getScoreHistory()
    │        passes Score[] to uPlot instance
    │
    └──▶ pdf/ExportButton (on tap)
             reads storage/getScoreHistory()
             snapshot canvas from chart/ (via ref)
             jsPDF renders: header (brand), table (scores), chart image, footer
             browser.saveAs(blob, "veines-scores.pdf")
```

### State Topology (Preact signals)

```
brandSignal          ← loaded once at boot from practice.json
localeSignal         ← navigator.language or practice.json override
answersSignal        ← ephemeral, lives only during active survey
sessionsSignal       ← hydrated from IndexedDB on app mount, kept in sync
notificationStatus   ← 'prompt' | 'granted' | 'denied', checked on mount
```

No global store. No context pyramid. Five signals, each owned by the module that writes them; other modules import read-only derived signals.

### Notification scheduling

```
After storage/saveSession(baseline)
    │
    ▼
notifications/scheduleReminders(baselineDate)
    │  Notification.requestPermission()
    │  registers four showTrigger timestamps via service worker
    │  (1mo, 3mo, 6mo, 1yr from baseline)
    ▼
service worker notification event
    │  fires at scheduled time even if tab is closed
    ▼
patient taps notification → deeplink to /?remind=1 → survey/ starts
```

**Important:** `showTrigger` / Notification Trigger API has limited browser support (Chrome 80+ on Android/desktop, not Safari as of 2026). Fallback: store reminder timestamps in IndexedDB; on each app open, check if a reminder is due and show an in-app banner. Both paths implemented; native trigger used when available.

---

## Module Directory Layout

This layout is "real OSS project" signal — everything has a home, nothing is orphaned.

```
vqol/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # build + lint + typecheck + Lighthouse on PR
│   │   └── deploy.yml          # build → GitHub Pages on push to main
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug.md
│   │   ├── feature.md
│   │   └── deploy-your-practice.md   # the virality hook
│   └── pull_request_template.md
│
├── demo/                       # seeded fake-patient data for GitHub Pages demo
│   └── seed.ts                 # generates plausible baseline+3 follow-up sessions
│
├── docs/                       # GitHub Pages publishes from /docs on main
│   └── (built output — gitignored in dev, committed by deploy.yml)
│
├── public/
│   ├── practice.json           # DEFAULT config — forks edit this, nothing else
│   ├── manifest.webmanifest
│   ├── favicon.svg
│   └── icons/                  # PWA icon set (48/72/96/128/192/512)
│
├── src/
│   ├── app/
│   │   ├── App.tsx             # root component, providers, router
│   │   ├── Router.tsx          # wouter-preact routes: /, /survey, /results, /history
│   │   └── signals.ts          # app-level signals (locale, brand)
│   │
│   ├── survey/
│   │   ├── questions.ts        # VEINES item definitions (text keys, scale, scoring direction)
│   │   ├── SurveyScreen.tsx    # orchestrates question cards, progress bar, submit
│   │   ├── AnswerCard.tsx      # single question UI — large tap targets, WCAG AA
│   │   └── signals.ts          # answers signal (ephemeral)
│   │
│   ├── scoring/
│   │   ├── index.ts            # calculateVeinesScore(answers) → ScoreResult
│   │   └── algorithm.md        # citable source for scoring algorithm
│   │
│   ├── storage/
│   │   ├── db.ts               # Dexie schema definition
│   │   ├── sessions.ts         # CRUD: saveSession, getSession, listSessions
│   │   └── scores.ts           # CRUD: saveScore, getScoreHistory
│   │
│   ├── chart/
│   │   ├── TrendChart.tsx      # uPlot wrapper, lower-is-better axis label
│   │   └── chartConfig.ts      # uPlot options, brand color injection
│   │
│   ├── pdf/
│   │   ├── buildReport.ts      # assembles jsPDF document (data + chart snapshot)
│   │   └── ExportButton.tsx    # lazy-imports buildReport on user gesture
│   │
│   ├── notifications/
│   │   ├── scheduler.ts        # scheduleReminders(baselineDate) — native + fallback
│   │   └── inAppBanner.tsx     # fallback reminder banner shown on app open
│   │
│   ├── i18n/
│   │   ├── index.ts            # t(key, locale?) — reactive to localeSignal
│   │   ├── en.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── de.json
│   │
│   ├── branding/
│   │   ├── loader.ts           # fetch /practice.json, validate, expose brandSignal
│   │   └── types.ts            # PracticeConfig type
│   │
│   ├── aggregate/              # off by default, gated by practice.json flag
│   │   └── submit.ts           # POST anonymized score to practice endpoint
│   │
│   └── lib/                    # cluster-shareable — see section below
│       ├── practice-config/
│       │   ├── schema.ts       # Zod schema for practice.json
│       │   └── validate.ts     # validatePracticeConfig(raw) → PracticeConfig
│       ├── pdf-export/
│       │   └── base.ts         # shared jsPDF page setup (header, footer, brand)
│       ├── i18n-loader/
│       │   └── index.ts        # generic locale → JSON translation loader
│       └── aggregate-submit/
│           └── index.ts        # POST anonymized payload to configurable endpoint
│
├── test/
│   ├── unit/
│   │   ├── scoring.test.ts     # high-value: deterministic, all published test cases
│   │   └── storage.test.ts     # Dexie in-memory adapter
│   ├── snapshot/
│   │   └── SurveyScreen.test.tsx
│   └── e2e/
│       └── happy-path.spec.ts  # Playwright: land → survey → score → PDF export
│
├── lighthouse/
│   └── lighthouserc.js         # Lighthouse CI config: performance ≥90, a11y ≥90
│
├── CLAUDE.md                   # project-level Claude instructions
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── FORKS.md                    # hand-curated list of practices that deployed
├── LICENSE                     # MIT
├── ROADMAP.md
├── SECURITY.md
├── README.md                   # landing-page quality: hero, GIF, deploy-in-5-min CTA
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## `practice.json` Schema

This is the ONLY file a forking practice needs to edit. Schema is validated at runtime by `lib/practice-config/validate.ts` using Zod; invalid config falls back to defaults and logs a console warning — the app never hard-fails due to a misconfigured fork.

```json
{
  "$schema": "./practice.schema.json",
  "practice": {
    "name": "Riverside Vein Center",
    "shortName": "Riverside Vein",
    "logoUrl": "",
    "logoBase64": "",
    "primaryColor": "#1a6b8a",
    "accentColor": "#e8f4f8",
    "contactPhone": "(555) 123-4567",
    "contactEmail": "info@example.com",
    "websiteUrl": "https://example.com"
  },
  "locale": {
    "default": "en",
    "supported": ["en", "es", "fr", "de"]
  },
  "reminders": {
    "schedule": [30, 90, 180, 365],
    "unit": "days"
  },
  "features": {
    "aggregateSubmit": false,
    "aggregateEndpoint": "",
    "showClinicianExport": true,
    "showTrendChart": true
  }
}
```

**Validation strategy:**
- `lib/practice-config/validate.ts` runs Zod parse on fetch result
- On parse failure: log `console.warn("practice.json invalid, using defaults: ", err.errors)` and merge with DEFAULT_CONFIG
- Fields with no fallback (aggregateEndpoint when aggregateSubmit=true): disable the feature and log, never throw
- Practice schema JSON file published at `practice.schema.json` — forks can validate in their editor

---

## State Management Decision

**Use Preact signals (`@preact/signals`).** Not nanostores. Not context.

Rationale:
- Signals are first-class in Preact — `.value` mutations cause surgical re-renders with no diffing overhead
- For ~1500 LOC, signals cover all needs: five app-level signals + ephemeral survey signal
- nanostores adds ~300 bytes and a second import pattern — the integration is `@nanostores/preact` and requires `useStore()` hook; signals eliminate the hook entirely
- Context is fine for static values (brand config after load) but causes full subtree re-renders on change — wrong choice for `answersSignal` which updates on every tap

**Signal ownership rule:** The module that defines a signal is the only module that calls `.value = x`. Other modules import the signal and read `.value` or use it as a derived computed signal. Prevents write-anywhere spaghetti.

---

## Routing Decision

**Use `wouter-preact`.** Not preact-router (deprecated). Not a custom router.

Rationale:
- `preact-router` is deprecated; Preact team directs users to `preact-iso` (SSR-focused) or wouter
- `wouter-preact` is 2.2 KB gzipped, explicit hash routing via `useHashLocation` hook
- Hash routing (`/#/survey`) is correct here: GitHub Pages serves one HTML file; history-mode 404s without a server rewrite rule. Hash routing works with zero server config on any static host.

Routes:
```
/#/            → HomeScreen (trend chart + "Start Follow-up" CTA)
/#/survey      → SurveyScreen
/#/results     → ResultsScreen (score card + share/export)
/#/history     → HistoryScreen (full score log)
```

Four screens. No nested routes. No params needed beyond a `?remind=1` query flag for notification deeplink.

---

## Service Worker Strategy

**Tool:** `vite-plugin-pwa` with `generateSW` strategy (Workbox-managed).

**What is cached:**
- App shell (all JS/CSS/HTML output from Vite build) — precached on install, `CacheFirst`
- `practice.json` — precached so offline branding works
- Translation JSONs (en/es/fr/de) — precached
- Icons and manifest — precached

**What is NOT cached by the SW:**
- `aggregateEndpoint` POST — network-only, fails silently offline
- External logo URLs in `practice.json` — stale-while-revalidate with fallback to blank

**Update propagation:**
- `registerType: 'autoUpdate'` — SW updates silently on next page load when a new version is deployed
- `cleanupOutdatedCaches: true` — old precache entries removed automatically
- Patient sessions are in IndexedDB — not in the SW cache, so updates never touch data

**Critical invariant:** The SW must never intercept IndexedDB operations. It intercepts only network/fetch events. Patient data lives in IndexedDB, fully outside SW control.

---

## Build-Phase Sequence

The suggested phase order from the prompt is correct. Confirmed rationale:

### Phase 1 — Vertical slice: scoring + survey + storage
**Scope:** `scoring/`, `survey/`, `storage/`, bare `app/` with wouter, basic CSS
**Why first:** Produces a working survey that stores data. Everything else depends on stored sessions. This is the "does it work?" proof. No branding, no i18n, English-only hardcoded strings.
**Done when:** Patient can complete VEINES form, score is calculated and persisted, second run shows prior score.

### Phase 2 — White-label + i18n
**Scope:** `branding/`, `i18n/`, `lib/practice-config/`, `lib/i18n-loader/`
**Why second:** White-label is the moat. The pattern must be nailed before adding features that need localized strings (reminders, PDF). i18n touches every UI string — adding it after Phase 1 is a one-time refactor, not a rewrite.
**Done when:** Fork a `practice.json`, reload, see brand colors/name applied. Switch browser language, see Spanish strings.

### Phase 3 — Patient/clinician value features
**Scope:** `chart/`, `pdf/`, `notifications/`, `lib/pdf-export/`
**Why third:** These are the features patients and clinicians actually use, but they depend on stored score history (Phase 1) and localized strings (Phase 2). Chart needs data. PDF needs brand + strings.
**Done when:** Trend chart renders history. PDF exports with practice branding. Notification permission prompt fires after baseline; reminder appears 30 days later (tested with shortened interval).

### Phase 4 — Repo virality + GitHub Pages deploy
**Scope:** CI/CD workflows, README hero, demo seed data, `FORKS.md`, issue templates, `ROADMAP.md`, `CHANGELOG.md`, Lighthouse CI, v0.1.0 release tag
**Why fourth:** The product is working before the distribution layer is built. Building viral surfaces on a broken product wastes time and burns reputation.
**Done when:** `github.com/ByteWorthyLLC/vqol` is public, demo link works, Lighthouse scores ≥90/90, README has GIF.

### Phase 5 — Aggregate submit + cluster lib extraction
**Scope:** `aggregate/`, `lib/aggregate-submit/`, extract `lib/` into documented, copy-paste-ready cluster utilities
**Why last:** Opt-in aggregate submit is off by default in MVP. The cluster lib extraction waits until patterns are proven stable — extracting too early creates premature abstractions that the next tool invalidates.
**Done when:** Practice can enable `aggregateSubmit: true` in `practice.json`, scores POST to their endpoint. `lib/` directory has a README explaining copy-paste-to-next-tool instructions.

---

## Cluster-Shared `lib/` Boundaries

These four modules are designed to be copy-pasted into `postsclera/`, `veinquest/`, `stockingfit/`, `veinmap/` with zero modification. They are NOT a published npm package in v1 — shared package adds tooling overhead that isn't worth it until 3+ tools are stable.

| Module | What it is | Who uses it |
|---|---|---|
| `lib/practice-config/` | Zod schema + validator for `practice.json` | All 5 cluster tools |
| `lib/i18n-loader/` | Generic locale→JSON loader, `t()` factory | All 5 cluster tools |
| `lib/pdf-export/` | jsPDF page setup with brand header/footer | vqol, postsclera (post-op summary PDF) |
| `lib/aggregate-submit/` | POST anonymized payload to configurable endpoint | All 5 cluster tools |

**What stays app-specific:**
- `scoring/` — VEINES algorithm is vqol-only; other tools have different scoring needs
- `survey/` components — question structure and UI is vqol-specific
- `notifications/scheduler.ts` — cadence logic (1mo/3mo/6mo/1yr) is vqol-specific; other tools use `lib/i18n-loader` but schedule their own reminders

**Future npm package trigger:** When 3+ cluster tools are active and `lib/` diverges between repos, publish `@byteworthy/vein-toolkit`. Not before.

---

## Test Strategy

### Unit tests (`test/unit/`) — Vitest
- `scoring.test.ts` is the highest-value test in the project. The VEINES-QOL/Sym algorithm is deterministic; published papers include example inputs/outputs. Test every published example case, plus edge cases (all-max, all-min, unanswered). Zero mocking needed.
- `storage.test.ts` uses Dexie's in-memory adapter (fake-indexeddb) — tests CRUD and migration logic.
- Do not write unit tests for UI components beyond scoring and storage. Snapshot tests cover UI structure.

### Snapshot tests (`test/snapshot/`) — Vitest + @preact/test-utils
- `SurveyScreen.test.tsx`: renders question 1, question 25, snapshot. Catches unintended structural regressions.
- One snapshot per major screen. Snapshots committed to repo — PRs that change the survey UI require reviewer to approve snapshot update.

### E2E tests (`test/e2e/`) — Playwright
- One happy-path spec: land on home → start survey → answer all 25 questions → see results screen → export PDF → check file downloaded.
- One notification spec: grant permission → complete baseline → verify notification is scheduled (check SW registration, not actual time travel).
- Run on CI via GitHub Actions (`playwright test`). Not run locally unless debugging.

### Lighthouse CI (`lighthouse/`)
- `lighthouserc.js` asserts: performance ≥90, accessibility ≥90, best-practices ≥90, PWA ≥90.
- Run on PR via CI workflow against the built artifact (not dev server).
- Accessibility ≥90 is non-negotiable — patient audience skews 60+.

---

## Architectural Patterns

### Pattern 1: Lazy-import heavy modules on user gesture

**What:** `pdf/buildReport.ts` and jsPDF (~230 KB gzipped) are dynamically imported only when the patient taps "Export PDF", not on app load.
**When:** Any module ≥50 KB that is not needed on initial render.
**Example:**
```typescript
// ExportButton.tsx
const handleExport = async () => {
  const { buildReport } = await import('../pdf/buildReport')
  await buildReport(scores, brand, locale)
}
```

### Pattern 2: Pure scoring engine as isolated module

**What:** `scoring/index.ts` exports one function `calculateVeinesScore(answers: Answer[]): ScoreResult`. No Preact imports. No storage imports. Pure TypeScript.
**When:** Any algorithm that must be unit-tested against published ground truth.
**Why:** Prevents score calculation from being contaminated by UI state or DB errors. Also means scoring can be extracted to a separate worker later if needed.

### Pattern 3: CSS custom properties for theming

**What:** `branding/loader.ts` writes brand colors to `document.documentElement.style.setProperty('--color-primary', config.practice.primaryColor)` at boot. All component styles reference `var(--color-primary)`.
**When:** White-label theming with zero per-component branding logic.
**Why:** No per-component brand prop drilling. No CSS-in-JS. Single source of truth for white-label customization. Works with Preact's static class approach.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Opening IndexedDB from multiple modules
**What happens:** Multiple Dexie instances, version mismatch errors, race conditions on first open.
**Prevention:** `storage/db.ts` exports a singleton Dexie instance. Every module that needs storage imports from `storage/sessions.ts` or `storage/scores.ts` — never directly from `storage/db.ts` outside the storage module.

### Anti-Pattern 2: Bundling jsPDF and uPlot in the initial JS chunk
**What happens:** First-load JS balloons to 400+ KB, Lighthouse performance score drops below 90, patients on 4G wait 3+ seconds.
**Prevention:** uPlot is lazy-imported by `chart/TrendChart.tsx` on the `/` route (deferred until chart is visible). jsPDF is lazy-imported only on PDF export gesture. Use `vite-plugin-pwa`'s asset precaching so second and subsequent loads are instant.

### Anti-Pattern 3: Storing practice config in component state
**What happens:** Brand flashes unstyled on load, components independently fetch `practice.json`, config is available in some subtrees but not others.
**Prevention:** `branding/loader.ts` runs at app mount (before first render, via `useLayoutEffect` in `App.tsx`), sets a `brandSignal`, and gates the app render on `brandSignal.value !== null`. One fetch, one source of truth.

### Anti-Pattern 4: Hard-coding scoring weights inline in survey components
**What happens:** Scoring logic is distributed across UI files. Impossible to unit-test. Algorithm change requires touching multiple components.
**Prevention:** `survey/` never computes a score. It collects `answers: Answer[]` and calls `scoring/calculateVeinesScore(answers)`. The survey module doesn't know what the scores mean.

### Anti-Pattern 5: History-mode routing on GitHub Pages
**What happens:** Patient bookmarks `https://org.github.io/vqol/results` and gets a 404 on reload because GitHub Pages doesn't serve `index.html` for unknown paths.
**Prevention:** Hash routing (`/#/results`). wouter-preact's `useHashLocation` hook. No 404 page needed. Works on every static host.

---

## Scaling Considerations

This is a static PWA with local storage — "scaling" means fork count and bundle size, not server load.

| Dimension | Approach |
|---|---|
| More practices forking | Each fork is independent — no central server. Fork count scales infinitely. |
| More languages | Add `src/i18n/XX.json` + entry in `practice.json` `supported`. Translation loader is generic. |
| Bundle size as features grow | Lazy-load boundaries already in place (PDF, chart). Keep eye on `vite-bundle-visualizer` output after each phase. |
| More PRO instruments (v2) | Each instrument is a new `survey/` + `scoring/` pair. `storage/` schema versioned via Dexie migrations. |
| Aggregate backend grows | `lib/aggregate-submit/` is already isolated. Practice provides their own endpoint — no central server in v1. |

---

## Sources

- Preact signals documentation: https://preactjs.com/guide/v10/signals/
- wouter-preact (deprecated preact-router, use wouter): https://github.com/molefrog/wouter
- Dexie.js IndexedDB wrapper: https://dexie.org
- vite-plugin-pwa service worker strategies: https://vite-pwa-org.netlify.app/guide/service-worker-precache
- uPlot vs Chart.js bundle size (~15 KB vs ~65 KB gzipped): https://github.com/leeoniya/uPlot
- jsPDF client-side PDF generation: https://github.com/parallax/jsPDF
- Vite static deploy to GitHub Pages: https://vite.dev/guide/static-deploy
- Notification Triggers API (Chrome 80+, not Safari): https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Re-engageable_Notifications_Push
- nanostores/preact integration (considered, not chosen): https://github.com/nanostores/preact

---

*Architecture research for: vqol — static VEINES-QOL/Sym PWA*
*Researched: 2026-04-25*
