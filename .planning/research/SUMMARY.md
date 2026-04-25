# Project Research Summary — vqol

**Project:** vqol — Patient-owned VEINES-QOL/Sym PRO tracker
**Domain:** Static PWA, healthcare OSS, viral white-label distribution
**Researched:** 2026-04-25
**Overall Confidence:** HIGH (stack, features, pitfalls), MEDIUM (instrument licensing specifics)

---

## Locked Stack (one line)

**Svelte 5 + svelte-spa-router (hash) + uPlot (lazy) + window.print() + CSS @media print + idb + paraglide-js + vite-plugin-pwa (injectManifest) + GitHub Actions (ci.yml + deploy-pages@v4)**

---

## Reconciliation: Three Stack-vs-Architecture Disagreements

### 1. Framework: Svelte 5 (DECIDED — over Preact + signals)

Svelte 5 wins on three axes that map to vqol's core mechanics:
- **Bundle**: ~2-3KB compiled runtime vs Preact's ~4KB. Older patient demographic → every Lighthouse TBT/TTI ms matters for the install-prompt conversion.
- **i18n**: Official paraglide CLI integration removes friction on the 4-locale v1 requirement.
- **Cluster-consistency cost is fictional**: no sibling tool exists yet; signal-ownership rules from Architecture translate trivially to runes.

The PROJECT.md "Preact" reference was a pre-research constraint; research supersedes it. Architecture's component decomposition, signal-ownership rules, and module layout all stand — just substitute Svelte 5 runes.

### 2. PDF Export: window.print() + CSS @media print (DECIDED — over jsPDF)

jsPDF is 230KB gzip — exceeds the entire app-shell budget for a library whose only job is "trigger save dialog." Lazy-load doesn't save it: every byte of deferred JS still costs perceived performance and hurts install motivation in a Safari tab.

Pitfall B-2 (canvas print silent-fail on iOS) applies to BOTH approaches; the fix (`canvas.toDataURL()` → `<img>` injection before `window.print()`) is required either way. Given that, CSS print costs zero bundle.

Implementation: block layout only in `@media print`, `@page { margin: 1.5cm; }`, canvas snapshot injected into `<img>` in print view before invoking. Test on Chrome + Firefox + iOS Safari before P3 closes.

### 3. IndexedDB: idb (DECIDED — over Dexie)

vqol has 3 object stores with simple CRUD. Dexie's query power is never exercised; 23KB delta is real bundle cost for zero functional benefit. `fake-indexeddb/auto` in Vitest setup resolves the Architecture file's testability concern — same underlying adapter Dexie uses. Singleton DB pattern from Architecture is unchanged.

---

## Executive Summary

vqol is a static, installable PWA implementing the VEINES-QOL/Sym PRO instrument — gold standard for chronic venous disease — delivered as a free, MIT-licensed, fork-and-deploy tool for vein practices. No backend, no SaaS, no per-response fees, no telemetry. Patient data lives in IndexedDB on-device.

The repo is built to spread: GitHub stars from devs (HN Show post), Reddit adoption from patients (r/varicoseveins, r/vascular), conference word-of-mouth from practice operators currently paying $5–10k/yr for closed PRO platforms. Each clinic fork = a public deployment that compounds social proof.

Technical approach is well-understood: Svelte 5 + Vite + idb + uPlot (lazy) + paraglide-js + vite-plugin-pwa. ~1500 LOC budget achievable. Architecture: pure scoring engine at the bottom, storage singleton above, feature modules (survey, chart, pdf, notifications) that depend on storage but never on each other. Cluster-shared `lib/` (practice-config, i18n-loader, pdf-export, aggregate-submit) seeds the pattern for postsclera/veinquest/stockingfit/veinmap.

**Primary risk is legal, not technical.** VEINES-QOL/Sym item text is controlled by Lamping/Schroter (LSHTM); no public statement grants OSS distribution. This is the single true launch blocker. Everything else (iOS storage eviction, SW update races, score-interpretation copy drift, brand-color WCAG failures) has a defined per-phase prevention.

---

## Table Stakes (must have or no adoption)

- VEINES-QOL/Sym 26-item questionnaire (Q2 descriptive only; 25 scored)
- Validated T-score scoring per Lamping 2003 / Kahn 2006 (VEINES-QOL: 25 items; VEINES-Sym: 10 items; Q3/Q6/Q7 reverse-scored; higher = better)
- IndexedDB local-only — zero network calls for patient data, ever
- Longitudinal trend chart (uPlot) — axis labeled "Higher = better"
- PDF export — clinician-ready, practice-branded, one page
- Web Notification reminders at 1mo / 3mo / 6mo / 1yr with iOS in-app-banner fallback
- WCAG 2.1 AA — 44×44px tap targets, 4.5:1 contrast, Lighthouse a11y ≥ 95
- Multi-language EN / ES / FR / DE — validated instrument translations only
- `practice.json` white-label config — the ONLY file a fork edits
- Installable PWA — manifest + service worker + offline shell
- Zero telemetry — CI network-call audit on built `dist/` on every PR
- Repo virality suite — README hero, animated GIF, FORKS.md, GitHub Discussions, ROADMAP.md, issue templates, badges

## Differentiators (the moat)

- Patient data ownership as explicit narrative
- Deploy in an afternoon with zero backend — "Deploy in 5 min" is the #1 practice conversion mechanic
- MIT-licensed, fully auditable source
- FORKS.md public registry turns passive forks into compounding social proof
- Anonymous aggregate opt-in submit (off by default) — practice gets outcomes without SaaS
- Operator context moat — author is Director of Operations at a real vein center

## Anti-features (part of the brand)

Document in CONTRIBUTING.md and FAQ:

- No clinical interpretation or severity labels on results (FDA SaMD exclusion boundary)
- No account system / login
- No backend / server of any kind
- No hosted SaaS
- No telemetry or analytics
- No EHR/EMR integration
- No third-party push notification service
- No other PRO instruments in v1
- No paid tier

**Defer to v2+:** anonymous aggregate submit (architecture ships P5 but stays off), IndexedDB export/import, CIVIQ-20/AVVQ instruments, practice-side dashboard, Swedish/Dutch/Italian translations, FHIR export.

---

## Pre-Launch Blockers (Phase 0 Gate)

| Blocker | Pitfall ID | Action | Fallback |
|---------|-----------|--------|---------|
| VEINES-QOL/Sym licensing letter from LSHTM | A-1 | Email Donna Lamping / Sara Schroter at LSHTM requesting OSS-distribution permission for verbatim item text + scoring constants | If denied / no response in 2 weeks: ship with placeholder text + link to JVS Venous supplementary PDF; document fallback in INSTRUMENT-LICENSE.md |
| INSTRUMENT-LICENSE.md in repo root | A-1 | Cite Lamping 2003 doi + Kahn 2006 doi + LSHTM credit | Ships regardless of permission outcome |

---

## Per-Phase Watch Out For

### Phase 1 (Survey + Scoring + Storage vertical slice)
| Pitfall ID | Description | Prevention |
|-----------|-------------|-----------|
| B-1, E-2 | SW update kills mid-survey session; partial session unscorable | IndexedDB draft-save on every answer selection; `registerType: 'prompt'`; "Resume survey" CTA |
| E-1 | Ceiling effect from inattentive answering | One question per screen; time-per-question tracking; gentle flag if total < 45s |
| E-5 | Locale switch mid-survey produces unscoreable mixed-instrument data | Lock locale at survey start; disable selector on `/#/survey` route |
| B-3 | iOS keyboard covers submit button | `100svh` not `100vh`; submit in fixed bottom bar |
| A-3, E-3 | Score interpretation copy drifts into clinical advice | Results screen accepts only `{ score, priorScore }` — no severity mapping, no color coding, no interpretation text |

### Phase 2 (White-label + i18n)
| Pitfall ID | Description | Prevention |
|-----------|-------------|-----------|
| C-1 | Invalid practice.json ships broken site | Zod with field-specific messages; `validate-practice-config` script in fork instructions |
| C-2 | Practice brand color fails WCAG AA | `scripts/validate-contrast.ts` as CI gate — hard fail, not advisory |
| C-3 | Empty-string translation placeholders cause blank labels | `allowEmptyMessage: false`; CI grep for `": ""` in non-EN files |
| C-4 | Unvalidated locale translations invalidate scores | Validated-translations-only allowlist; CI warning on new `messages/XX.json` |

### Phase 3 (Chart + PDF + Notifications)
| Pitfall ID | Description | Prevention |
|-----------|-------------|-----------|
| B-2 | Canvas not converted before window.print() — iOS silent fail | Inject `canvas.toDataURL()` as `<img>`; wait for uPlot `hooks.ready` |
| B-4 | iOS install prompt absent — 7-day eviction destroys longitudinal story | Prominent install prompt after baseline; detect standalone mode |
| E-4 | Reminder fatigue causes PWA uninstall | Max 2 push notifications per interval; `{ firedCount, acknowledged }` in IndexedDB; in-app banner after cap |
| B-6 | Print CSS inconsistencies | Block layout only in `@media print`; manual test Chrome + Firefox + iOS Safari |

### Phase 4 (Repo Virality + GH Pages Deploy)
| Pitfall ID | Description | Prevention |
|-----------|-------------|-----------|
| D-1 | Show HN backfire from missing demo or false claims | Demo live with realistic seeded data on mobile Safari before any launch post; Show HN draft reviewed against actual demo |
| D-2 | Reddit subreddit moderation bans | Pre-contact mods for r/varicoseveins, r/vascular, r/lymphedema; patient-utility framing; link to github.com not custom domain |
| D-4 | Outcomes claims imply clinical validation of the tool | README copy: all claims cite the instrument, never vqol itself |
| D-3 | Practice asks for BAA | SECURITY.md: explicit "ByteWorthyLLC is not a Business Associate" |
| B-5 | Accidental telemetry via transitive deps | CI: `grep -r "fetch\|beacon\|analytics\|sentry" dist/` fails on any hit |

### Phase 5 (Aggregate Submit + Cluster lib Extraction)
| Pitfall ID | Description | Prevention |
|-----------|-------------|-----------|
| A-2 | HIPAA exposure from unsecured aggregate endpoint | HTTPS-only enforcement in `practice-config/validate.ts`; runtime rejection of `http://` |
| A-6 | Practice asks ByteWorthyLLC to sign BAA for aggregate feature | SECURITY.md updated; `practice.schema.json` `aggregateEndpoint` description includes BA disclaimer |

---

## Cluster-Shareable libs

| Module | Path | Shared by | Contents |
|--------|------|-----------|---------|
| practice-config | `src/lib/practice-config/` | All 5 tools | Zod schema for practice.json + validate() with field-specific error messages |
| i18n-loader | `src/lib/i18n-loader/` | All 5 tools | Generic locale → JSON loader, t() factory, locale persistence to localStorage |
| pdf-export | `src/lib/pdf-export/` | vqol, postsclera | `@media print` base styles, canvas.toDataURL() injection pattern, window.print() wrapper |
| aggregate-submit | `src/lib/aggregate-submit/` | All 5 tools | POST anonymized payload; HTTPS-only enforcement |

**App-specific (do NOT extract):** `scoring/` (VEINES algorithm), `survey/` components, `notifications/scheduler.ts` (1mo/3mo/6mo/1yr cadence).

**`@byteworthy/vein-toolkit` npm package trigger:** When 3+ cluster tools are active and `lib/` diverges between repos. Not before.

---

## Bundle Budget (must hold)

Target: app shell ≤ 100KB gzip; full loaded app ≤ 120KB gzip.

| Slice | Estimate | Notes |
|---|---|---|
| Svelte 5 runtime | ~3KB | Compiled away; single import surface |
| idb | ~3KB | 3 object stores; simple CRUD |
| paraglide + 4 locales | ~10–15KB | Tree-shaken per page |
| App code | ~25–35KB | ~1500 LOC budget at TS-stripped weight |
| CSS + service worker | ~15KB | Tailwind-free; hand-rolled CSS custom properties |
| **Shell total** | **58–73KB** | All initial-load |
| uPlot (lazy on `/#/results`) | ~47KB | Lazy import; never loaded for `/#/survey` flow |
| **Loaded total (post-chart)** | **~105–120KB** | Acceptable |

**Excluded entirely:** jsPDF (230KB), Dexie (26KB), Chart.js (254KB), React, Tailwind, SvelteKit, semantic-release, any analytics/telemetry library, any third-party push service.

---

## Phase Ordering Rationale

1. **Phase 0 (Legal)** runs in parallel with Phase 1 — only verbatim item text is the legal risk surface; algorithm + architecture work proceeds with placeholder text.
2. **Phase 1 (Vertical slice)**: scoring + survey + storage. Everything depends on stored sessions.
3. **Phase 2 (White-label + i18n)**: i18n touches every UI string — adding it before P3 features avoids re-translation churn.
4. **Phase 3 (Patient/clinician value)**: chart + PDF + reminders all depend on stored history (P1) and localized strings (P2).
5. **Phase 4 (Virality + Deploy)**: must have a working product before building distribution.
6. **Phase 5 (Aggregate + Cluster lib)**: aggregate is off by default; ships last because compliance docs depend on P2 patterns.

**No phase requires a `/gsd-research-phase` invocation** — the research is comprehensive enough.

---

## Confidence Assessment

| Area | Level | Notes |
|---|---|---|
| Stack | HIGH | Bundle sizes verified via bundlephobia + npm + GitHub releases |
| Features | HIGH | VEINES-QOL/Sym structure sourced from Lamping 2003 + Kahn 2006 + PMC validation papers |
| Architecture | HIGH | Module boundaries, signal ownership, SW strategy, routing all sound |
| Pitfalls | HIGH (regulatory/PWA/iOS), MEDIUM (instrument licensing) | HIPAA, FDA SaMD exclusion, iOS storage eviction, SW update race verified |
| Instrument licensing | UNKNOWN | Phase 0 email to LSHTM resolves; placeholder text in P1 development |

### Open gaps (handled by phase or async work)

| Gap | Where handled |
|---|---|
| VEINES-QOL/Sym Scoring Manual (item-level normative means/SDs) | Phase 0 LSHTM email requests; Kahn 2006 supplementary partially reproduces |
| LSHTM permission status | Phase 0 email; placeholder text + fallback plan keep P1–P3 unblocked |
| iOS Safari print on canvas | Manual three-browser test scheduled in Phase 3 |
| paraglide bare-Vite (non-SvelteKit) init | Phase 2 setup verifies during dependency install |
| uPlot ARIA accessibility | Implement explicit `aria-label` + `role="img"` + visually-hidden `<table>` fallback in Phase 3 |

---

## Sources

**Primary (HIGH):** Lamping DL et al. *J Vasc Surg* 2003; Kahn SR et al. *J Clin Epidemiol* 2006; bundlephobia/npm size data; vite-plugin-pwa docs; Svelte 5 release notes; WebKit storage policy (7-day eviction); iOS Web Push (16.4 requirement); HHS WCAG 2.1 AA healthcare mandate (July 2024); fastenhealth/fasten-onprem Show HN; actions/deploy-pages@v4; Contributor Covenant v3.0 (July 2025).

**Secondary (MEDIUM):** paraglide bare-Vite path (verify in P2); VEINES-QOL/Sym OSS-redistribution status (PROQOLID record not confirmed); Svelte 5 production bundle (~2-3KB depends on code splitting).

**Tertiary (Phase 0 resolves):** LSHTM permission for OSS verbatim item text — unknown until email sent.

---

*Research synthesized: 2026-04-25*
*Ready for roadmap: yes — Phase 0 legal gate runs in parallel with Phase 1 development*
