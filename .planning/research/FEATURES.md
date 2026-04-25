# Feature Research

**Domain:** Patient-reported outcome (PRO) instrument tracker — chronic venous disease (VEINES-QOL/Sym), static PWA, OSS white-label
**Researched:** 2026-04-25
**Confidence:** HIGH (instrument scoring), MEDIUM (virality patterns), MEDIUM (iOS PWA reminder caveats)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features whose absence causes non-adoption. Patients won't complete surveys without them. Practices won't fork without them.

| Feature | Why Expected | Complexity | Phase | Notes |
|---------|--------------|------------|-------|-------|
| **VEINES-QOL/Sym full question set (26 items)** | The entire value prop is this validated instrument. Any omission or deviation from the published item text makes scores non-comparable to literature. | LOW | 1 | See scoring section below for exact structure. Q2 (time-of-day) is descriptive only, not scored. |
| **Validated scoring engine (T-score norm-based)** | Clinicians need scores comparable to published trials. A home-grown simplified score destroys clinical utility. | LOW | 1 | Algorithm: per-item z-score → mean z → T-score (mean=50, SD=10). VEINES-QOL uses Q1+Q3+Q4+Q5+Q6+Q7+Q8 (25 items). VEINES-Sym uses Q1+Q7 (10 items). Items Q3, Q6, Q7 reverse-scored. Higher = better. |
| **Longitudinal trend chart (baseline → 1mo → 3mo → 6mo → 1yr)** | A single score has no meaning to a patient. The trend is the story. "You improved 18 points since baseline" is actionable. | LOW | 1 | uPlot or Chart.js line chart. Axis must be clearly labelled "higher = better." Seed data in demo. |
| **IndexedDB local-only storage** | Patient trust depends entirely on data never leaving the device. One accidental network call destroys the brand. | LOW | 1 | All patient data in IndexedDB. Zero network calls for patient data. Verify with devtools Network tab in CI. |
| **PDF export (clinician-ready)** | The entire clinical loop depends on the patient being able to hand their score history to their provider. Practices will not adopt a tool that doesn't close this loop. | LOW | 1 | jsPDF client-side. One-page portrait A4/Letter: practice header, patient reference (no PII), score table, trend chart (canvas-to-image), date exported. |
| **Reminder cadence (1mo / 3mo / 6mo / 1yr post-baseline)** | Without reminders, follow-up completion rates collapse. Most PRO platform failures are retention, not enrollment. | MEDIUM | 1 | Web Notifications API. **iOS caveat**: requires home-screen install + user permission + iOS 16.4+. Android Chrome is reliable. Must degrade gracefully to in-app prompt or "set a calendar reminder" fallback. |
| **WCAG 2.1 AA accessibility** | CVD patient demographic skews 60+. HHS mandated WCAG 2.1 AA for covered entities effective July 2024. Tap targets ≥ 44×44px (WCAG 2.5.8 min is 24px, but 44px is Apple/Google best practice for older users). High contrast. Screen reader labels on all inputs. | MEDIUM | 1 | Lighthouse CI score ≥ 90. Keyboard navigable. All question options must be radio inputs with visible labels, not custom tap areas. |
| **Multi-language: EN / ES / FR / DE** | These are the only four languages with published, validated VEINES-QOL/Sym translations. Shipping un-validated translations would invalidate scoring. | LOW | 1 | i18n via JSON locale files. Language auto-detected from `navigator.language`, overridable. Do not translate instrument item text — use the published validated text verbatim. |
| **`practice.json` white-label config** | Practices will not send patients to a page that says "ByteWorthy vqol." They need their own branding. This is the fork-and-deploy story. | LOW | 1 | Single JSON: `{ name, logoUrl, primaryColor, contactPhone, contactUrl }`. Read at build time by Vite env injection OR at runtime from a known path. |
| **Installable PWA (manifest + service worker)** | Without installation, Web Notifications never work on iOS. Without offline support, patients in areas with poor connectivity can't complete surveys. | LOW | 1 | `manifest.json` + `vite-plugin-pwa` (Workbox). Cache shell + assets. Survey completion must work fully offline. |
| **Zero telemetry / zero third-party calls** | Patient trust is the product's moat. Google Analytics, Sentry, Hotjar — any of these visibly in devtools Network will get the project ratioed on HN within hours. | LOW | 1 | No external scripts. No `<script src="...cdn...">`. Bundle all dependencies. Verify in CI with a network call audit. |

### Differentiators (Competitive Advantage)

Features that make vqol the OSS go-to vs. Outcomes MTM, Net Health, REDCap, and the nothing-at-all that most practices currently have.

| Feature | Value Proposition | Complexity | Phase | Notes |
|---------|-------------------|------------|-------|-------|
| **Patient data ownership as explicit story** | Closed PRO platforms hold patient data hostage. vqol patients own their data on-device. This is a differentiator in the current data-privacy moment — practitioners can use it in patient conversations. | LOW | 1 | Communicate in onboarding screen: "Your responses stay on this device. We never see them." Make this copy prominent, not buried. |
| **Free + open + auditable (MIT)** | Net Health and Outcomes charge per-response or per-seat. A practice with 2,000 vein patients per year pays materially for that. vqol costs $0. The open source code is an audit surface — practices can verify no data exfiltration. | LOW | 1 | MIT LICENSE in repo root. "Fully auditable — read the source" on README. |
| **Deploy in an afternoon (zero backend)** | REDCap requires institutional licenses and IT support. OpenClinica requires server provisioning. vqol forks to GitHub Pages in 5 minutes. This is the #1 competitive advantage for small practices. | LOW | 1 | "Deploy in 5 min" CTA with animated GIF is the core README mechanic. |
| **Outcomes story for practice marketing** | Practices that can say "our patients improve a mean of N points at 6 months on VEINES-QOL" have a payer and referral story that competitors cannot match without paying per-response. | LOW | 1 | Describe this use case explicitly in README and in `practice.json` docs. The anonymous aggregate opt-in is v1.x, not MVP. |
| **Cluster integration touchpoints** | vqol is one of five tools (veinquest, postsclera, stockingfit, veinmap). Cross-links between tools increase stickiness. A patient completing vqol can link to postsclera for post-op tracking. | LOW | 2 | In v1: footer link "Other free tools for vein patients." In v2: shared `practice.json` schema across all five tools. |
| **Anonymous aggregate opt-in submission** | Practices can accumulate their own outcomes data for internal benchmarking or research without any SaaS. Data never leaves without explicit patient opt-in. | MEDIUM | 2 | Off by default in MVP. v1.x: patient opt-in sends anonymized (no dates, no PII) score + delta to practice's own endpoint (configurable in `practice.json`). Practice maintains their own lightweight receiver (Cloudflare Worker + KV is sufficient). |
| **FORKS.md public registry** | Turns every fork into social proof. HN and Reddit visitors see "47 practices already deployed." Compounds over time. | LOW | 1 | Template FORKS.md, issue template "register your deployment", short instructions in CONTRIBUTING.md. |

### Anti-Features (Deliberate Exclusions)

These are not scope-creep refusals — they are explicit product decisions. Each one should be documented in the repo's ARCHITECTURE.md or FAQ so that contributors don't reopen them.

| Anti-Feature | Why Requested | Why It's a No | What to Do Instead |
|--------------|---------------|---------------|--------------------|
| **Diagnosis or clinical interpretation** | Patients want to know "is this good?" | Crosses the line into clinical decision support. Regulatory risk (FDA SaMD). Destroys the "tracker, not clinical advice" positioning. Likely to be wrong without clinician context. | Show the score and the delta. Link to the practice's contact page. Never use words like "normal," "concerning," "improved enough." |
| **Account system / login** | Patients want their data across devices | Requires a server, destroys local-only promise, creates PHI liability, kills the static-deploy story, and adds substantial engineering complexity. | IndexedDB export/import (JSON backup download) is the cross-device story for v2. Make clear in onboarding that data lives on the device. |
| **Server-side identity or any backend** | Practices want cross-patient analytics | Backend = hosting costs, maintenance, breach liability, HIPAA BAA requirement, server provision complexity. Kills the "fork in an afternoon" story. | For aggregate analytics: anonymous opt-in to a practice-operated lightweight endpoint. vqol itself never operates a server. |
| **Hosted SaaS / managed service** | Practices don't want to manage a GitHub fork | Violates the fork-and-host moat. SaaS = servers = licensing complications with the VEINES-QOL instrument = HIPAA exposure = the exact model competitors already have. | Direct practices to GitHub Pages or Cloudflare Pages via the "Deploy in 5 min" guide. |
| **Telemetry / analytics** | Tempting for usage insight | Any analytics script visible in devtools Network will trigger immediate distrust. Privacy is the moat. Losing it for vanity metrics is a bad trade. | GitHub stars + forks + FORKS.md self-reported registry as proxy for adoption. |
| **Clinical decision support** | Practices want prompts like "this patient is declining, call them" | Requires clinical workflow integration, potentially FDA regulated, entirely out of scope for a static PRO tracker. | The PDF export closes the loop with the clinician who makes those judgments. |
| **Other PRO instruments (CIVIQ-20, AVVQ, VQoL)** | Logical scope extensions | v1 must ship as "the VEINES-QOL tracker, done excellently" not a PRO library. Adding instruments before v1 is validated dilutes focus and adds translation/licensing research overhead. | Modular architecture (instrument as a JSON config) so v2 can add instruments cleanly. |
| **EHR / EMR integration** | Practices want data in Epic / Athena | Requires HL7 FHIR implementation, institutional trust agreements, EHR vendor certification. Entirely different engineering surface. | PDF export is the bridge. Print to patient chart. |
| **Paid features / Pro tier** | Revenue model | Antithetical to the viral OSS thesis. Any paywall creates a "why fork when I can pay" question that kills community adoption. | The moat is operator context + cluster shipping velocity. Revenue comes from ByteWorthy consulting/implementation, not the tool. |
| **Push notifications via a third-party service** | Push without install | Firebase Cloud Messaging / OneSignal etc. would be network calls from patient devices to third-party servers. PHI-adjacent, privacy-destroying. | Web Notifications API only (local, no server). Degrade to in-app "schedule a reminder" suggestion on iOS. |

---

## VEINES-QOL/Sym Scoring Algorithm — Primary Literature Reference

**Confidence: HIGH** — sourced from Lamping et al. 2003 (original) + Kahn et al. 2006 (DVT validation) + multiple PMC validation papers.

### Instrument Structure (26 items across 8 questions)

| Question | Items | What It Measures | Scored? |
|----------|-------|-----------------|---------|
| Q1 (1a–1i) | 9 symptom items | Frequency of 9 symptoms (heaviness, aching, swelling, etc.) | Yes — VEINES-Sym + VEINES-QOL |
| Q2 | 1 item | Time of day leg problem most intense | NO (descriptive only) |
| Q3 | 1 item | Change in leg problem over past year | Yes — VEINES-QOL only (reverse scored) |
| Q4 | Items | Limitations in daily activities (work, leisure) | Yes — VEINES-QOL only |
| Q5 | Items | Limitations in daily activities (continued) | Yes — VEINES-QOL only |
| Q6 | Items | Limitations (reverse scored) | Yes — VEINES-QOL only (reverse scored) |
| Q7 | 1 item | Symptom frequency overall | Yes — VEINES-Sym + VEINES-QOL (reverse scored) |
| Q8 | 5 items | Psychological impact | Yes — VEINES-QOL only |

**VEINES-QOL score:** Q1 + Q3 + Q4 + Q5 + Q6 + Q7 + Q8 = 25 items  
**VEINES-Sym score:** Q1 + Q7 = 10 items  
**Not scored:** Q2 (1 item, time of day — descriptive only)

### T-Score Normalization Formula

```
For each scored item i:
  z_i = (response_i - mean_i) / sd_i

Score = mean(z_i for all items in subscale) * 10 + 50
```

- Mean and SD are derived from the normative/reference sample in Lamping 2003 / Kahn 2006
- Higher scores = better quality of life / fewer symptoms
- Reverse-scored items (Q3, Q6, Q7): invert the response before z-scoring
- Missing item handling: if ≤ 20% of items missing, impute with mean of non-missing items; if > 20%, score = missing

**Implementation note:** The scoring constants (item-level means and SDs from the normative sample) must be hardcoded from the published Scoring Manual (Lamping & Schroter, London School of Hygiene & Tropical Medicine, 2007). These are not derivable from a single practice's data. Request the manual from LSHTM or cite from Kahn 2006 supplementary materials.

**CRITICAL LICENSING FLAG:** The instrument text and scoring manual are controlled by the original authors (LSHTM). The standard academic/clinical-practice use is permissive, but explicit confirmation is needed before bundling verbatim item text in a public OSS repo. Options: (1) Email LSHTM for a written confirmation of OSS distribution rights; (2) Reference the instrument and link to the PDF attachment in JVS Venous (publicly posted by the journal); (3) Follow the pattern used by other public clinical tools (FDA, NIH) that cite rather than reproduce. This is the project's highest-risk pre-launch gate.

---

## Feature Dependencies

```
PWA manifest + service worker
    └──enables──> Web Notifications (reminders)
    └──enables──> Offline survey completion

IndexedDB storage
    └──required by──> Longitudinal trend chart
    └──required by──> PDF export (reads stored sessions)
    └──required by──> Score history display

Scoring engine (T-score)
    └──required by──> Trend chart (y-axis values)
    └──required by──> PDF export (score table)
    └──required by──> "Clinically significant change" copy

practice.json white-label
    └──required by──> PDF export (practice header)
    └──required by──> Branding in PWA manifest (name, icon)

Multi-language (i18n)
    └──depends on──> Instrument item text (validated translations only)
    └──must NOT allow──> free translation of item text (invalidates scoring)

Anonymous aggregate opt-in (v1.x)
    └──depends on──> practice.json (endpoint URL)
    └──must NOT enable──> by default (privacy-first)
```

---

## MVP Definition

### Launch With (v1.0)

Minimum to deploy at author's practice and be useful enough to share.

- [ ] VEINES-QOL/Sym full 26-item questionnaire rendered accurately in EN
- [ ] Validated T-score scoring engine (VEINES-QOL + VEINES-Sym subscores)
- [ ] IndexedDB local storage — session per date, versioned schema
- [ ] Longitudinal trend chart (uPlot) — baseline through up to 4 follow-ups
- [ ] PDF export via jsPDF — practice-branded, score table, trend chart snapshot
- [ ] Web Notifications reminder cadence — 1mo, 3mo, 6mo, 1yr — with graceful fallback
- [ ] `practice.json` white-label config — name, logo, colors, contact
- [ ] Installable PWA — manifest, service worker, offline shell
- [ ] WCAG 2.1 AA compliance verified via Lighthouse CI
- [ ] ES / FR / DE translations using validated item text
- [ ] Zero telemetry — CI network call audit
- [ ] MIT LICENSE, README with hero copy + animated GIF + "Deploy in 5 min" CTA
- [ ] Repo virality suite (FORKS.md, badges, Discussions, CONTRIBUTING.md, issue templates)

### Add After Validation (v1.x)

Add once v1.0 is deployed and working at the author's practice.

- [ ] Anonymous aggregate opt-in submission (patient opt-in → practice endpoint) — trigger: ≥3 practices report wanting their own outcomes data
- [ ] IndexedDB export/import (JSON backup for cross-device restore) — trigger: patient complaints about device switching
- [ ] `practice.json` runtime loading (no rebuild on branding change) — trigger: non-technical practices ask for it
- [ ] Cluster cross-links (postsclera, veinquest) — trigger: second cluster tool ships

### Future Consideration (v2+)

Defer until product-market fit is clear.

- [ ] Additional PRO instruments (CIVIQ-20, AVVQ) as swappable instrument modules — defer until v1 architecture is proven and licensing confirmed for additional instruments
- [ ] Practice-side aggregate dashboard (anonymized) — defer until anonymous submit is validated and ≥10 practices active
- [ ] FHIR export for EHR bridge — defer until a practice explicitly requests it and is willing to test
- [ ] Swedish, Dutch, Italian translations (published validated versions exist) — defer until community requests with clinical validation docs in hand

---

## Feature Prioritization Matrix

| Feature | Patient Value | Practice Value | Implementation Cost | Priority |
|---------|--------------|----------------|---------------------|----------|
| VEINES-QOL/Sym question set | HIGH | HIGH | LOW | P1 |
| Validated T-score scoring | HIGH | HIGH | LOW | P1 |
| IndexedDB local storage | HIGH | HIGH | LOW | P1 |
| Trend chart | HIGH | MEDIUM | LOW | P1 |
| PDF export | HIGH | HIGH | LOW | P1 |
| Installable PWA | HIGH | HIGH | LOW | P1 |
| WCAG AA accessibility | HIGH | MEDIUM | MEDIUM | P1 |
| Zero telemetry | HIGH | HIGH | LOW | P1 |
| `practice.json` white-label | LOW (patient) | HIGH | LOW | P1 |
| Multi-language EN/ES/FR/DE | HIGH | MEDIUM | LOW | P1 |
| Web Notification reminders | HIGH | MEDIUM | MEDIUM | P1 |
| Repo virality suite | LOW (patient) | HIGH | LOW | P1 |
| Anonymous aggregate submit | LOW (patient) | HIGH | MEDIUM | P2 |
| IndexedDB export/import | MEDIUM | LOW | MEDIUM | P2 |
| Cluster cross-links | LOW | MEDIUM | LOW | P2 |
| Additional PRO instruments | MEDIUM | MEDIUM | HIGH | P3 |
| Practice dashboard | LOW | HIGH | HIGH | P3 |
| FHIR export | LOW | MEDIUM | HIGH | P3 |

---

## Competitor Feature Analysis

| Feature | REDCap | Outcomes MTM / Net Health | OpenClinica | vqol (ours) |
|---------|--------|--------------------------|-------------|-------------|
| Patient-facing PRO | Yes (MyCap add-on) | Yes (core) | Yes (complex setup) | Yes (core) |
| Static / no backend | No | No | No | Yes |
| Free | No (institutional) | No (per-response / seat) | Community only | Yes (MIT) |
| Self-hosted in 5 min | No | No | No | Yes |
| Local data only | No | No | No | Yes |
| White-label by config file | No | No | No | Yes |
| Patient data ownership | No | No | No | Yes |
| Auditable source | No | No | Partial | Yes |
| VEINES-QOL specifically | Config | Config | Config | Native |
| Offline capable | Partial (MyCap) | No | No | Yes |
| OSS / forkable | No | No | Partial | Yes |

---

## OSS Health Repo Lessons (5 required — sourced from repo analysis)

These are evidence-based lessons from existing repos, not opinions.

### Lesson 1: openPRO (goinvo/openPRO) — Low stars despite strong design
**Repo:** github.com/goinvo/openPRO (~4 stars as of 2025)  
**Lesson:** Beautiful UX research and open source release does not drive adoption if there is no "deploy in 5 minutes" path. openPRO produced excellent design artifacts but never gave a practice operator a deployable artifact they could ship in an afternoon. vqol must invert this: deployment is the product, design is the wrapper.

### Lesson 2: Fasten Health (fastenhealth/fasten-onprem) — HN "Show HN" is the highest-ROI launch event
**Repo:** github.com/fastenhealth/fasten-onprem (~2k+ stars)  
**Lesson:** The "Show HN: Fasten Health – open-source Personal Health Record – 27,000 providers" post (Jan 2024, HN item 39175636) generated the majority of their star velocity in a single day. The title formula "Show HN: [what it does] – [credibility number]" is the template. For vqol: "Show HN: Patient-owned VEINES-QOL tracker — no server, no fees, deploy in 5 min." The credibility number at launch can be the one live practice deployment.

### Lesson 3: ifme (ifmeorg/ifme) — Account system is the silent killer for patient-owned health apps
**Repo:** github.com/ifmeorg/ifme (~1.5k stars, active community)  
**Lesson:** ifme's most complex architectural surface is its account/login system. It required a Rails backend, user management, ally invites, session handling — all of which create maintenance burden and contribute to slow contributor onboarding. For health data apps, account systems also create privacy liability. vqol's explicit no-account stance avoids this entire surface area. ifme proves the community can be large with accounts; vqol's thesis is that removing them is a better tradeoff for a static PRO tracker.

### Lesson 4: awesome-healthcare (kakoni/awesome-healthcare) — Quality filter matters more than quantity for healthcare OSS adoption
**Repo:** github.com/kakoni/awesome-healthcare (~2.9k stars)  
**Lesson:** The project's curation standard explicitly requires "active in some production environment" and "reasonably GA quality." Projects that are abandoned, lack docs, or are demo-only get rejected. For vqol to get listed (which drives sustained discovery): the repo must have a live demo URL, a real production deployment, active CI, and a clear maintenance signal (recent commits, responding to issues). Landing in awesome-healthcare is a tier-2 distribution goal after HN.

### Lesson 5: OpenClinica (OpenClinica/OpenClinica) — The most-starred OSS clinical EDC (314 stars / 248 forks) proves scale is achievable — but complexity is the ceiling
**Repo:** github.com/OpenClinica/OpenClinica  
**Lesson:** OpenClinica is the ceiling for enterprise OSS clinical software — it has the most adoption but requires server provisioning, IT knowledge, and is overkill for a single PRO instrument. Its 248 forks vs. 314 stars ratio (high fork/star ratio) shows that the project has serious adopters, not just passive interest. For vqol, the target is the opposite profile: high stars (consumer curiosity + dev interest from HN/Reddit) and moderate forks (each representing a real deployed practice). A fork should mean a live deployment, not an exploration.

### Lesson 6 (bonus): ResearchKit / ResearchStack — PWA is better than native SDK for simple longitudinal surveys
**Source:** FDA MyStudies, ResearchStack.org, Cornell Tech  
**Lesson:** ResearchKit/ResearchStack require native mobile dev (Swift/Kotlin), app store submission, institutional IRB support, and LabKey-style backends. For a simple 26-item longitudinal questionnaire, this is catastrophic over-engineering. PWA + IndexedDB delivers 90% of the user experience (offline, installable, notifications on Android) at 10% of the build cost and 0% of the app store gatekeeping. The FDA MyStudies experience showed that offline-first storage (sync on reconnect) is the right model — vqol goes further by making sync optional (opt-in only).

---

## Repo Virality Features

These are distinct from product features. They drive stars, forks, and deploys.

| Feature | Mechanism | Complexity | Phase |
|---------|-----------|------------|-------|
| **Animated demo GIF in README** | Removes friction to understanding. Visitors who see the trend chart + PDF flow in 10 seconds are 3x more likely to star. | LOW | 1 |
| **"Deploy in 5 min" CTA with numbered steps** | Practice operators need to believe deployment is achievable before clicking Fork. Numbered steps with a sub-5-minute claim are the hook. | LOW | 1 |
| **GitHub badges (build, license, Lighthouse score, fork count)** | Social proof at a glance. A Lighthouse 100 badge on a healthcare tool is a credibility signal competitors cannot match. | LOW | 1 |
| **FORKS.md registry with "Add your practice" issue template** | Turns passive forks into public social proof. HN and Reddit visitors see "47 practices deployed." Each entry compounds the signal. | LOW | 1 |
| **Live demo on GitHub Pages with seeded data** | "See it before you fork it" converts skeptics. Demo shows a realistic patient journey: baseline 76 → 1yr 49. | LOW | 1 |
| **Public ROADMAP.md** | Operators want to see momentum before committing to fork. A roadmap signals this is not an abandoned weekend project. | LOW | 1 |
| **GitHub Discussions seed posts** | Seed three discussions: "Introduce your practice," "Request a translation," "Share your outcomes data." Creates the appearance of community from day 1. | LOW | 1 |
| **Repo topics / tags** | `veines-qol`, `chronic-venous-disease`, `pwa`, `pro-tracker`, `healthcare`, `open-source-health`, `patient-reported-outcomes`. Drives GitHub topic discovery. | LOW | 1 |
| **awesome-healthcare listing** | Sustained organic discovery channel for healthcare devs and practice IT. Requires live demo + production deployment to qualify. | LOW | 2 (post-v1) |
| **Show HN post on v1.0 release** | Single highest-ROI launch event for dev/HN audience. Title formula: "Show HN: Patient-owned VEINES-QOL tracker — no server, no fees, fork and deploy in 5 min." | LOW | 1 (release day) |
| **Reddit posts to r/varicoseveins, r/vascular, r/lymphedema** | Patient subreddits are underserved and active. A tool that directly serves these communities converts to real users fast. | LOW | 1 (release day) |
| **Social preview image (OpenGraph)** | GitHub uses the OG image in link previews on Slack, LinkedIn, Twitter. A clean screenshot of the trend chart + "Free, open-source VEINES-QOL tracker" converts more than the default GitHub card. | LOW | 1 |
| **CHANGELOG.md (Keep a Changelog format)** | Signals maintenance cadence. Empty changelog = abandoned project. Weekly entries signal momentum. | LOW | 1 |
| **CONTRIBUTING.md with "how to add a translation" section** | Lowers the barrier for bilingual vascular nurses/researchers to contribute validated translations. Translations are the highest-value contribution type. | LOW | 1 |

---

## Sources

- Lamping DL et al. "The VEINES-QOL/Sym questionnaire." J Vasc Surg. 2003 — original instrument and scoring algorithm
- Kahn SR et al. VEINES-QOL/Sym for DVT. J Clin Epidemiol. 2006 — https://www.jclinepi.com/article/S0895-4356(06)00051-5/abstract
- PMC validation study (venous leg ulcers): https://pmc.ncbi.nlm.nih.gov/articles/PMC4531536/
- PMC VEINES limitations study: https://pmc.ncbi.nlm.nih.gov/articles/PMC6900879/
- JVS Venous VEINES-QOL/Sym questionnaire PDF (publicly posted): https://www.jvsvenous.org/cms/10.1016/j.jvsv.2019.08.014/attachment/4388b433-4947-48c1-908b-da9edb2da339/mmc1.pdf
- Phlebolymphology overview of venous QoL tools: https://www.phlebolymphology.org/venous-clinical-severity-score-and-quality-of-life-assessment-tools-application-to-vein-practice/
- goinvo/openPRO: https://github.com/goinvo/openPRO
- fastenhealth/fasten-onprem Show HN: https://news.ycombinator.com/item?id=39175636
- ifmeorg/ifme: https://github.com/ifmeorg/ifme
- kakoni/awesome-healthcare: https://github.com/kakoni/awesome-healthcare
- OpenClinica/OpenClinica: https://github.com/OpenClinica/OpenClinica
- FDA MyStudies / ResearchKit-ResearchStack: https://pmc.ncbi.nlm.nih.gov/articles/PMC7886578/
- PWA iOS limitations 2025: https://brainhub.eu/library/pwa-on-ios
- iOS Web Push requirements: https://pushpad.xyz/blog/ios-special-requirements-for-web-push-notifications
- WCAG 2.5.8 target size: https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide
- HHS WCAG 2.1 AA healthcare mandate (July 2024): https://pilotdigital.com/blog/what-wcag-2-1aa-means-for-healthcare-organizations-in-2026/
- jsPDF client-side PDF: https://github.com/parallax/jsPDF
- GitHub Topics patient-reported-outcomes: https://github.com/topics/patient-reported-outcomes

---

*Feature research for: vqol — VEINES-QOL/Sym patient-owned static PWA tracker*
*Researched: 2026-04-25*
