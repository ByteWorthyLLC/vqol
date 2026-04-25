# Pitfalls Research

**Domain:** Patient-facing PRO instrument tracker — static PWA, healthcare OSS, viral white-label distribution
**Researched:** 2026-04-25
**Confidence:** HIGH (regulatory/HIPAA/FDA exclusions verified against official sources), HIGH (iOS/PWA storage), HIGH (SW update mechanics), MEDIUM (instrument licensing — no public LSHTM policy found, risk inferred from PRO industry norms)

---

## Category A: Healthcare-OSS-Distribution Pitfalls

---

### A-1: Instrument Licensing Ambiguity (Launch Blocker)

**Severity: Critical**

**What goes wrong:**
The VEINES-QOL/Sym item text and scoring normative constants (per-item means and SDs from Lamping 2003 / Kahn 2006) are the intellectual property of the original authors at LSHTM. No public statement grants OSS distribution rights to reproduce the verbatim item text. A journal publishes the questionnaire PDF as a supplementary file, but "publicly posted by a journal" is not a license to bundle it in a shipping software product. If vqol goes public on GitHub without written permission and LSHTM or their licensing agent sends a DMCA takedown notice to GitHub, the repo goes dark immediately — potentially mid-deployment at the author's clinic — and the entire viral distribution channel collapses before it starts.

**Why it happens:**
Academic instrument authors routinely grant free clinical/research use in papers and assume that means no permission is needed. "The paper is open access" is conflated with "the questionnaire text is open source." They are not the same legal category. The PRO industry (Mapi Research Trust, HealthActCHQ, PROQOLID) operates precisely in this gap, charging licensing fees for instruments whose papers are freely published.

**Warning signs:**
- PROQOLID or Mapi Research Trust lists VEINES-QOL/Sym with a licensing contact rather than a "freely available" badge
- No explicit OSS distribution permission found in paper supplementary materials
- "For clinical/research use — contact authors for other uses" language anywhere in the scoring manual or correspondence with LSHTM

**Prevention:**
1. **Pre-launch**: Send a written email to the LSHTM contact author (Donna Lamping / Sandra Schroter) explicitly asking: "We are building an open-source (MIT-licensed) patient-facing static web application that bundles the VEINES-QOL/Sym item text verbatim. Do you grant permission for this use?" Keep the email reply.
2. **Fallback if no reply in 2 weeks**: Consult PROQOLID / Mapi Research Trust record for VEINES-QOL/Sym — if it shows "free for non-commercial use," that may be sufficient; if it shows "contact for licensing," treat as restricted.
3. **Nuclear fallback**: Strip verbatim item text from the repo; instead reference the JVS Venous supplementary PDF URL and instruct forks to read the questionnaire from the publicly posted source. The scoring engine (pure math) is unambiguously unprotected. The specific words of 25 questions are the risk surface.
4. **README acknowledgment**: Regardless of permission outcome, include an `INSTRUMENT-LICENSE.md` crediting Lamping & Schroter, LSHTM, and the original publication. This signals good faith and makes any future dispute easier to resolve.

**DMCA/C&D Response Runbook:**
If a takedown notice arrives:
1. **Do not panic.** GitHub's DMCA counter-notice process allows restoration of content within 10-14 business days if you have a good-faith basis.
2. **Evaluate the claim**: Is the claim about (a) verbatim item text or (b) the scoring algorithm? Scoring algorithms are math, not copyrightable. Item text is the risk.
3. **If item text is the issue**: Respond to the takedown by removing the verbatim text, replacing with "See [DOI] for item text." File a counter-notice if the original posting was licensed by the authors.
4. **Contact the EFF** (eff.org) — the Open Source Legal team handles exactly this type of academic-instrument-meets-OSS dispute and provides free guidance.
5. **Preserve evidence**: Keep the permission email, any paper language about "clinical use," and PROQOLID record at the date of repo creation. These are your exhibits.

**Phase to address:** Phase 1 (before any public commit that includes item text). This is the only true launch-blocker — a Phase 0 gate.

---

### A-2: "It's Local-Only So HIPAA Doesn't Apply" — True, But With Traps

**Severity: High**

**What goes wrong:**
The statement is essentially correct: HHS's guidance on mobile health apps confirms that an app provided by a vendor directly to consumers (not by a covered entity or its business associate) is not subject to HIPAA even when it stores health data. vqol deployed by a practice to patients is not, by itself, a covered transaction — the practice is not transmitting the data to vqol, the patient is self-entering it locally. However, two edge cases create liability:

1. **Aggregate submit enabled by a practice**: When a practice enables `aggregateSubmit: true` and scores POST to their endpoint, the practice IS a covered entity receiving patient health data via a system they operate. They now have a HIPAA obligation for that endpoint. vqol itself does not become a BA, but the practice's endpoint does require appropriate safeguards. If the README does not say this clearly, a practice will deploy the aggregate feature naively with no BAA or encryption.

2. **Practice-hosted fork with login/account added**: A practice developer adds a login layer to their fork "for analytics." Now the practice IS collecting patient-linked health data through what is effectively a covered transaction. Again, vqol-core is fine, but the fork README must make the boundary unmistakable.

**Why it happens:**
HIPAA's covered-entity definition is counter-intuitive. Most people assume "health data + healthcare organization = HIPAA automatically." The actual trigger is the entity type and the nature of the data transmission, not the data content alone.

**Warning signs:**
- A forking practice emails asking "how do we set up the aggregate feature to post to our EHR"
- A PR that adds user authentication or a backend endpoint to vqol
- A practice asks "do we need to sign a BAA with you to deploy?"

**Prevention:**
- `docs/PRIVACY-COMPLIANCE.md` in the repo with explicit plain-language statements: "vqol core (local-only) is NOT a covered transaction under HIPAA — patient data never leaves the device." "If you enable `aggregateSubmit`, the receiving endpoint YOU operate may trigger HIPAA obligations. Consult your compliance officer."
- `practice.json` `aggregateSubmit` flag must have a JSON `$comment` or `description` in `practice.schema.json` that says "Enabling this causes patient scores to be transmitted. Your practice's receiving endpoint must comply with applicable privacy regulations."
- The main README must have a "Privacy Architecture" section that is scannable in 30 seconds, not buried in a wiki.

**Phase to address:** Phase 2 (when white-label and practice.json config are built). Aggregate feature in Phase 5 must include this documentation as a done criterion.

---

### A-3: FDA SaMD Classification — This Tool Is Very Likely Excluded, But The Line Is Specific

**Severity: High**

**What goes wrong:**
The FDA's 21st Century Cures Act (Section 3060, amending FD&C Act Section 520(o)) explicitly excludes from "medical device" definition software that:
- Helps patients/users self-manage their disease without providing specific treatment suggestions
- Provides simple tools to organize and record health information
- Is specifically marketed to help patients document and communicate with their health care providers

A static PRO tracker that collects symptom/QOL data, calculates a validated score, and shows a trend chart almost certainly falls in this excluded category. **However**, the line is crossed if the software:
- Recommends a specific treatment or intervention based on the score
- Claims to diagnose a condition or severity level
- Claims to predict clinical outcomes
- Provides interpretation guidance that goes beyond "higher is better" (e.g., "Your score indicates severe venous disease")

If copy in the app says things like "Your score of 42 suggests your condition is worsening and you should contact your doctor immediately," that is clinical decision support — which requires either FDA clearance or a defensible argument under the non-device CDS exclusion (which requires the clinician be able to independently review the basis for the recommendation, which a static app cannot provide).

**Why it happens:**
Marketing copy added to results screens to make the app feel more clinically meaningful. "Your score improved significantly" is fine. "Your score of 42 is below normal and may indicate worsening disease" is not.

**Warning signs:**
- Any results screen copy that includes words: "normal," "abnormal," "concerning," "indicates," "suggests you may have," "worsening" in relation to clinical state
- Any comparison to population norms that implies the patient has a specific diagnosis or severity
- A contributor PR that adds an "interpretation guide" to the score card

**Prevention:**
- Results screen must show only: the score number, the delta from prior score, "higher is better" label, and a call to action ("Share this with your provider"). Zero clinical interpretation copy.
- Create a `ANTI-FEATURE: Clinical Interpretation` entry in CONTRIBUTING.md that explicitly says interpretation copy will not be merged and explains why.
- Any comparison to published norms must be framed as "in the study population, scores ranged from X to Y" — never as "your score is below normal."
- EU MDR Note: The EU MDR 2017/745 MDSW guidance follows similar logic — software that directly influences clinical decisions or diagnoses is a medical device. A pure data-recording/tracking tool is generally not MDSW. But the same copy-pollution risk applies.

**Phase to address:** Phase 1 (build the results screen with correct copy), Phase 4 (README marketing copy review before public launch).

---

### A-4: State Telehealth / Privacy Regulations — Narrow Risk But Real

**Severity: Medium**

**What goes wrong:**
California's CMIA (Confidentiality of Medical Information Act) and Illinois' BIPA, while primarily targeting data brokers and covered entities, have been stretched in litigation to apply to health-adjacent apps that collect identifiable health information. vqol's local-only architecture means no data transmission occurs in the default configuration, which is a strong protection. However:

- If the app collects any device identifier alongside health data (even in the service worker), California might argue CMIA applies to the practice that distributed the link
- Washington's My Health MY Data Act (2023) has a very broad definition of "consumer health data" and applies to any business that operates commercially in Washington State serving Washington consumers

**Why it happens:**
State health privacy laws are expanding faster than federal guidance. A practice in California deploying vqol for 500 patients technically causes those 500 patients' data to be processed on a California-resident-owned device. Whether the practice or the OSS repo author is the "collector" is legally ambiguous.

**Warning signs:**
- A deployed practice is in California, Washington, or Illinois
- Any issue asking "do we comply with CMIA?"
- A service worker that logs any identifiable information (device model, IP from service worker fetch)

**Prevention:**
- Service worker must not log any request or device data. Confirm in CI that the service worker source contains no `console.log`, no `navigator.*` calls that expose identifiers, and no analytics calls.
- The only data that exists is in IndexedDB on the patient's device. The practice never receives it (without explicit aggregate opt-in). This is the legal protection.
- Add a "State Privacy Compliance" section to `docs/PRIVACY-COMPLIANCE.md` noting that local-only architecture means no "collection" by the practice under most state laws' definitions, but advising practices with Washington/California/Illinois patients to consult their legal counsel if enabling aggregate submit.

**Phase to address:** Phase 2 (privacy documentation), Phase 5 (aggregate submit must include explicit state law warnings).

---

### A-5: Liability for Patient Self-Tracking Without Clinician in the Loop

**Severity: Medium**

**What goes wrong:**
A patient's score drops sharply between visits — indicating worsening venous disease — but the patient interprets "lower is bad, I should tell my doctor" correctly while the practice never sees the data because the PDF was never shared. If a patient's condition deteriorates and there is a subsequent adverse event, a plaintiff's attorney could argue the practice "provided a tool" that gave the patient false reassurance (the trend chart showed prior improvement), contributing to delayed care. The practice never saw the data, but they distributed the link.

**Why it happens:**
Practices adopt patient-facing tools without thinking through the clinical workflow. "They can share the PDF" is not a care pathway — it is an aspiration.

**Warning signs:**
- Practice asks "can we make the scores automatically send to us?" (this is the aggregate feature — enabling it without clinical workflow is actually worse)
- A patient-facing FAQ that says "your scores help your care team monitor your progress" without a mechanism for that to happen

**Prevention:**
- App onboarding screen (shown once) must include: "Your scores are stored on this device. To include them in your care, tap 'Export PDF' and share with your provider at your next appointment."
- `practice.json` `showClinicianExport` defaults to `true` and must not be turned off — the PDF export is the clinical safety mechanism.
- README must include a "Clinical Use Notice" section advising practices to communicate to patients that scores are for self-awareness and clinician conversations, not continuous monitoring.
- Add to the score results screen a prominent "Share with your care team" prompt — not buried, above the fold.
- Disclaimer in app footer (non-intrusive): "This tool tracks your quality of life scores. It is not a substitute for clinical care. Contact your provider if you have concerns."

**Phase to address:** Phase 1 (onboarding screen and disclaimer), Phase 3 (results screen CTA design).

---

### A-6: Practice Fork Accidentally Enables Aggregate Submit — BAA Exposure

**Severity: Medium**

**What goes wrong:**
A technically-savvy practice developer forks, sets `aggregateSubmit: true` and `aggregateEndpoint: "https://their-ehr.example.com/api/scores"` in practice.json. Their EHR endpoint is not secured. Patient scores are now being POSTed to an unsecured endpoint, creating a potential HIPAA breach. The practice then asks ByteWorthyLLC for a BAA "since you're our vendor."

ByteWorthyLLC is not a business associate: it publishes static OSS code, has no contractual relationship with the practice, and processes no patient data on any server. But a naive practice — and more importantly, a naive practice's legal counsel — may not understand this.

**Why it happens:**
Practices understand SaaS relationships. They don't understand "we are an OSS publisher with no server." Their instinct is "software vendor = BAA required."

**Warning signs:**
- An email or GitHub issue asking ByteWorthyLLC to sign a BAA
- A fork that sets aggregateSubmit without a clearly secured endpoint

**Prevention:**
- `SECURITY.md` must have a section: "Business Associate Agreement — ByteWorthyLLC is not a Business Associate. This project runs entirely in the patient's browser. ByteWorthyLLC operates no servers and processes no patient data. No BAA with ByteWorthyLLC is necessary or appropriate."
- `practice.schema.json` `aggregateEndpoint` description field: "Must be an HTTPS endpoint. If this tool is deployed in a clinical context in the United States, your receiving endpoint must comply with applicable HIPAA Security Rule requirements. ByteWorthyLLC is not your business associate."
- The `aggregate/submit.ts` module must enforce HTTPS only (reject http:// endpoints at runtime and during `practice.json` validation). Fail loudly if protocol is not https.

**Phase to address:** Phase 2 (schema validation), Phase 5 (aggregate feature implementation with this guard baked in).

---

## Category B: Static-PWA Pitfalls

---

### B-1: Service Worker autoUpdate Bricks a Mid-Survey Patient Session

**Severity: Critical**

**What goes wrong:**
`vite-plugin-pwa` with `registerType: 'autoUpdate'` uses Workbox's `clientsClaim` + `skipWaiting`, meaning a new service worker activates immediately when available, claiming all open tabs. If the patient is on question 18 of 25 and a new build deploys, the new SW activates, the app shell is replaced, and the ephemeral `answersSignal` (which lives in-memory, not IndexedDB) is lost. The patient sees a blank page or the survey resets to question 1. Their partially-completed survey is gone, with no way to recover. The patient abandons.

**Why it happens:**
autoUpdate is the default recommendation in vite-plugin-pwa docs because it works well for apps without in-progress user sessions. Nobody reads the race condition warning in the Workbox documentation. A patient PRO survey is exactly the wrong place for autoUpdate.

**Warning signs:**
- `registerType: 'autoUpdate'` in `vite.config.ts` with no session-protection guard
- No "save progress" to IndexedDB on every question answer
- Lighthouse audit passes but no testing of update-during-survey scenario

**Prevention:**
- **Primary**: Write every answer to IndexedDB immediately on selection (not just on survey submit). Store a `session_in_progress` record with `{ questionIndex, answers[], startedAt }`. On app init, check for an in-progress session and offer "Resume your survey."
- **Secondary**: Use `registerType: 'prompt'` instead of `autoUpdate` so patients are not interrupted mid-session. Show the "new version available — reload when ready" banner only when NOT on `/#/survey` route. Check `window.location.hash !== '#/survey'` before prompting.
- **Workbox timing pitfall**: The vite-plugin-pwa docs note a 1-minute heuristic where rapid rebuilds trigger the "external event" path instead of the update path, causing the "ready to work offline" dialog to show unexpectedly. Add at least 2 minutes between test deploys when testing update behavior.

**Phase to address:** Phase 1 (IndexedDB answer persistence), Phase 3 (service worker update strategy review before reminders feature).

---

### B-2: iOS Safari Evicts IndexedDB After 7 Days if PWA Not Installed

**Severity: Critical**

**What goes wrong:**
WebKit's storage policy (as updated and documented at webkit.org/blog/14403/updates-to-storage-policy/) evicts all script-writable storage — including IndexedDB — for any origin that has no user interaction within 7 days. This policy applies to Safari browser tabs. It does NOT apply to installed PWAs (added to Home Screen), which have their own separate storage partition with persistent storage.

Implication: A patient who receives a text message with the vqol link, answers their baseline survey in Safari, and never visits again for 30 days until their 1-month follow-up will find all their data gone. Their baseline score — the foundation of the entire longitudinal story — is lost. They must start over. This kills the product's entire value proposition.

**Why it happens:**
Developers test on desktop Chrome or Android Chrome where this eviction policy does not apply. iOS-specific behavior is discovered too late, after real patient data is lost.

**Warning signs:**
- No "Install to Home Screen" prompt in the app onboarding
- Testing only on desktop Chrome/Firefox
- A `navigator.storage.persist()` call is absent

**Prevention:**
- **Highest priority mitigation**: The app onboarding screen (shown after baseline survey completion) must strongly prompt iOS users to install to Home Screen: "To protect your scores and receive follow-up reminders, add this app to your Home Screen." Provide a visual GIF showing the iOS Share → Add to Home Screen flow.
- Call `navigator.storage.persist()` — on browsers that support it (Chrome, Firefox, Edge), this promotes storage to "persistent" and prevents eviction. On Safari it is a no-op but does no harm.
- The results screen must also show a prominent "Your data is saved on this device — install to your Home Screen to prevent data loss on iOS" notice when `navigator.platform` indicates iOS and PWA is not installed (check `window.navigator.standalone === false`).
- Detect installed state: `window.matchMedia('(display-mode: standalone)').matches`. If false and iOS detected, show the install banner on every session until installed.
- CI test: add a note in the Playwright e2e spec that Safari storage eviction cannot be simulated in CI but must be manually verified on iOS before each release.

**Phase to address:** Phase 1 (IndexedDB schema), Phase 3 (install prompt UX).

---

### B-3: iOS Safari PWA Quirks Beyond Notifications

**Severity: High**

**What goes wrong — four specific failure modes:**

1. **Web Share API**: `navigator.share()` works on iOS Safari but only when invoked from a user gesture and only when the browser is in focus. In a standalone PWA, share dialogs can silently fail if called from a `.then()` chain rather than directly from the event handler. The PDF export → share-to-doctor flow must test this.

2. **Viewport height with software keyboard**: On iOS, `100vh` does not account for the software keyboard. Survey screens with inputs lose the submit button behind the keyboard. Use `100svh` (small viewport height — supported iOS 15.4+) instead of `100vh` for any full-height layout.

3. **Form input zoom**: Any `<input>` with `font-size < 16px` triggers iOS Safari's auto-zoom on focus, shifting the layout unpredictably. Survey answer buttons that are styled as large tap-target blocks (not `<input>` elements) avoid this, but any text input in the practice config or onboarding must have `font-size: 16px` minimum.

4. **Service Worker cache and iOS 14**: iOS 14 had a regression where SW cache was cleared on app relaunch from Home Screen. This was fixed in iOS 15.4. vqol should document minimum supported iOS version as 15.4 in README.

**Warning signs:**
- Developers test PWA only on latest iOS
- `100vh` used in any full-screen component CSS
- Any `<input type="text">` styled with `font-size` below 16px

**Prevention:**
- Use `100svh` everywhere `100vh` appears in CSS. Add an eslint-plugin rule or a grep CI step that flags `100vh` in CSS.
- All survey answer buttons must be `<button>` elements (not `<input type="radio">`-derived). Large tap targets achieved via `min-height: 44px` CSS.
- PDF export share must call `navigator.share()` directly inside the click event handler, not deferred in a promise chain.
- Add `minimum-ios-version: 15.4` to README compatibility table.
- Manual iOS Safari testing checklist in CONTRIBUTING.md: viewport height, keyboard push, share API, SW install behavior.

**Phase to address:** Phase 1 (survey component CSS), Phase 3 (PDF export share flow).

---

### B-4: Lighthouse Score Drift After Dependency Updates

**Severity: High**

**What goes wrong:**
The CI Lighthouse threshold is set to performance ≥95, a11y ≥95. A `npm update` that pulls in a new version of `uPlot` (which is lazy-loaded but affects chunk hashing) or a new `paraglide` locale runtime could push a JS chunk above the threshold, dropping performance below 95. CI now fails, blocking all deploys. Alternatively, a new version of a dependency changes ARIA output in a way that drops the accessibility score below threshold, and nobody notices until a practice tries to deploy a hotfix and finds CI broken.

**Why it happens:**
Lighthouse scores are affected by both bundle size and runtime behavior (layout shift, LCP element timing). Dependencies that add even 5-10KB to a non-lazy chunk can drop performance from 98 to 93 in one CI run.

**Warning signs:**
- `package.json` dependencies pinned to `^` (semver minor/patch) rather than exact versions
- No `npm ci` lock-file discipline (contributors running `npm install` and committing lockfile changes)
- Lighthouse score hovering at 96-97 (no headroom for any regression)

**Prevention:**
- Pin exact versions in `package.json` for all dependencies (remove `^` prefix). Use Dependabot or Renovate for controlled, PR-gated updates.
- Set Lighthouse thresholds at warning level (not error) for performance (≥90 warn, ≥95 error only on purpose-built perf PRs). Only accessibility stays at ≥95 as hard error — patient safety rationale.
- Run `npm audit` and `npm outdated` as separate CI steps; fail on critical vulnerabilities only, not on outdated packages.
- `vite-bundle-visualizer` output committed as an artifact in CI for every PR — any chunk that grows >10KB gets a flag comment in the PR.

**Phase to address:** Phase 4 (CI/CD setup).

---

### B-5: Accidental Telemetry from Third-Party Libraries

**Severity: Critical**

**What goes wrong:**
Several popular JS libraries include postinstall telemetry or runtime analytics that the consuming project doesn't know about. Examples from prior incidents: `next.js` posts telemetry by default (opt-out required), some Vite plugins have optional analytics. More importantly: if a contributor adds a "helpful" debugging library or a practice fork adds `@sentry/browser` without reading vqol's no-telemetry policy, the first time a HN reader opens DevTools Network tab, they see external requests. The resulting HN comment "this healthcare app calls out to sentry.io with patient timing data" will destroy the project's reputation within 2 hours and likely trigger a thread that lives in Google search results forever.

**Why it happens:**
Well-intentioned contributors adding error monitoring. One line of code added during debugging that never got removed. A practice fork that adds Plausible "just for this deployment" not knowing it now appears in the project README's fork list.

**Warning signs:**
- Any new dependency added to `package.json` that has "analytics," "tracking," "reporting," or "monitoring" in its npm description
- A PR that adds `import * from 'sentry'` or `import * from '@vercel/analytics'` or similar
- A practice fork in FORKS.md whose deployment shows network requests in DevTools

**Prevention:**
- CI job: After `npm run build`, run a network call audit against the built output. Use `grep -r "fetch\|XMLHttpRequest\|navigator.sendBeacon\|import.*beacon\|import.*analytics\|import.*sentry" dist/` as a smoke test. Fail CI on any hit.
- Add to `CONTRIBUTING.md`: "vqol has a zero-telemetry policy. No PRs adding analytics, error reporting, or tracking libraries will be merged. This is a non-negotiable product constraint."
- Add a `postinstall` check: scan `node_modules` after `npm ci` for known telemetry packages (semgrep or a custom script checking for `postinstall` scripts in dependencies).
- For FORKS.md — add a disclaimer: "Listed forks are independently operated. ByteWorthyLLC does not audit fork deployments for telemetry compliance. If you fork, you are responsible for your deployment's privacy behavior."
- SECURITY.md: "If you discover telemetry in vqol or a fork, report it via the security disclosure channel."

**Phase to address:** Phase 1 (CI network audit from day 1), Phase 4 (CONTRIBUTING.md telemetry policy).

---

### B-6: Print CSS Inconsistency Makes Clinician PDF Unusable

**Severity: High**

**What goes wrong:**
The CSS `@media print` + `window.print()` approach is the correct choice for bundle size. However, cross-browser print rendering has well-documented inconsistencies:

- Chrome prints A4 PDF that fits on one page. Firefox adds browser-injected headers/footers that overlap the practice logo. Safari on iOS produces a portrait layout where the chart is cut off.
- `page-break-inside: avoid` behavior is inconsistent. A score table that fits on one page in Chrome spans two pages in Firefox due to different pagination algorithms.
- CSS Grid in print media is supported but behaves differently. Use CSS Flexbox or block layout for the print view — grid printing has known bugs across browser print engines.
- The uPlot chart is a `<canvas>` element. Canvas does not print reliably across all browsers — it may appear blank in some print engines. Canvas must be converted to a data URL (`canvas.toDataURL('image/png')`) and injected as an `<img>` element in the print view before `window.print()` is called.

**Why it happens:**
Testing PDF export only in Chrome (where it works perfectly), never in iOS Safari (where the patient most likely uses it).

**Warning signs:**
- PDF export tested only in Chrome dev
- uPlot chart appears as a white box in PDF export on Safari
- Practice logo overflows the page header in Firefox PDF

**Prevention:**
- `canvas.toDataURL()` snapshot injected into the print template as `<img>` before `window.print()` is invoked. This is the canonical fix for canvas-in-print.
- Use `block` layout only in `@media print` CSS — no `grid`, no `flex` with `wrap`.
- Add `@page { margin: 1.5cm; }` to eliminate browser-injected header/footer area from overlapping content. Note: this is not supported in all browser print engines but is the correct declaration.
- Manual E2E test matrix in CONTRIBUTING.md: Chrome print, Firefox print, iOS Safari Share → Print. All three must show a clean one-page report before Phase 3 is done.
- Playwright E2E: `page.pdf()` generates a PDF for visual inspection — add as a CI artifact, reviewed manually on each release.

**Phase to address:** Phase 3 (PDF export implementation).

---

### B-7: i18n Translation Key Drift

**Severity: Medium**

**What goes wrong:**
A developer adds a new UI string in English and uses it as `m.new_survey_reminder_copy()` but forgets to add `new_survey_reminder_copy` to `messages/es.json`, `messages/fr.json`, and `messages/de.json`. Paraglide catches this at compile time — CI fails. Good. But if the developer adds a placeholder `"new_survey_reminder_copy": ""` (empty string) to the non-English files to make CI pass, the compiled app silently renders blank text in Spanish/French/German. Patients see an empty label and assume the app is broken.

**Why it happens:**
Developers silence compile errors with empty-string placeholders to unblock CI. The real fix (commissioning a translation) takes time they don't have in a sprint.

**Warning signs:**
- `messages/es.json` has keys with empty string values
- Any commit message like "fix: add placeholder translations to unblock CI"
- A PR that adds strings to `en.json` without corresponding entries in `es.json`, `fr.json`, `de.json`

**Prevention:**
- Paraglide enforces keys at compile time — never use empty strings. Use English fallback: in the i18n loader, if a key is missing from the active locale, fall back to `en` with a `console.warn`. Configure paraglide's `allowEmptyMessage: false` in `project.inlang/settings.json`.
- CI lint step: `grep -n '": ""' src/i18n/es.json src/i18n/fr.json src/i18n/de.json` fails if any empty string is found.
- PR template: "If this PR adds or changes any UI string in `en.json`, all other locale files must be updated. Empty strings are not acceptable. Use English as fallback text with a TODO comment if translation is pending."
- For the VEINES-QOL/Sym item text specifically: NEVER modify item text in any locale. These are validated instrument translations. The CI should run a hash check on the instrument question keys to detect unauthorized changes to the item text.

**Phase to address:** Phase 2 (i18n setup), Phase 4 (CI lint additions).

---

## Category C: White-Label / Fork-and-Host Pitfalls

---

### C-1: practice.json Validation Gaps Ship a Broken Site

**Severity: Critical**

**What goes wrong:**
A practice forks, edits `practice.json`, and introduces a JSON syntax error (trailing comma, unescaped quote in practice name). The Zod validator at runtime catches this and falls back to DEFAULT_CONFIG — but the app renders with no practice branding (showing "VEINES-QOL Tracker" instead of "Riverside Vein Center"). The practice sends the link to patients, patients arrive at a site that looks like a generic demo, and the practice thinks something is broken and abandons the deployment. The practice never learns to debug JSON.

Worse case: `primaryColor` is set to `"#g00"` (invalid hex). The CSS custom property is written to the document as `--color-primary: #g00`. All practice-branded buttons render as an unstyled fallback. The app looks broken to patients.

**Why it happens:**
Practice staff editing JSON without a schema validator in their editor. JSON errors are invisible to non-developers. The Zod fallback-to-default behavior is silent.

**Warning signs:**
- practice.json in a fork does not have `"$schema": "./practice.schema.json"` pointing to the published schema
- No deployment verification step in the README fork instructions
- A practice files an issue saying "the branding isn't showing"

**Prevention:**
- `practice.schema.json` published at repo root. Every fork's README instructions must include: "Validate your practice.json before deploying: `npx ajv-cli validate -s practice.schema.json -d public/practice.json`."
- Zod runtime validation must log a specific human-readable error message that names the failing field: `console.error("practice.json: 'primaryColor' is not a valid hex color. Falling back to default. Your branding will not appear.")`. Not a generic schema error dump.
- Color validation: the Zod schema for `primaryColor` and `accentColor` must use `.regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex color like #1a6b8a')`. A CI step in the main repo runs `ajv-cli validate` on the canonical `public/practice.json` as a build gate — so the pattern is tested and visible.
- Add a `verify-deployment` checklist to the README fork instructions: (1) JSON validates, (2) practice name appears in the PWA title bar, (3) primary color appears on buttons, (4) baseline survey completes and stores a score.

**Phase to address:** Phase 2 (practice.json schema and validation).

---

### C-2: Brand Color Contrast Failures from Practice-Supplied Colors

**Severity: High**

**What goes wrong:**
A practice supplies `primaryColor: "#f5c518"` (bright yellow) as their brand color. The app applies this as button background color with white text. Yellow + white is a contrast ratio of approximately 1.8:1 — a catastrophic WCAG AA failure (requires 4.5:1). A 68-year-old patient with early macular degeneration cannot read the buttons. The practice is now deploying an accessibility-broken tool, potentially violating the HHS WCAG 2.1 AA mandate for covered entities.

**Why it happens:**
Practices supply brand colors that look fine on their marketing materials (where they have full design control) without awareness of WCAG contrast requirements. Nobody checks.

**Warning signs:**
- practice.json submitted with a light or highly saturated primary color
- No automated contrast check in the deployment process
- A deployed fork receives an accessibility complaint from a patient

**Prevention:**
- Add `color-contrast` npm package (~1KB) as a dev dependency. Write a build-time validation script (`scripts/validate-contrast.ts`) that:
  1. Reads `primaryColor` and `accentColor` from `practice.json`
  2. Calculates WCAG contrast ratios for: `primaryColor` + white text, `primaryColor` + black text, `accentColor` + primary text
  3. Fails the build (non-zero exit) if any ratio is below 4.5:1 for normal text or 3:1 for large text
  4. Prints a human-readable message: "Your primaryColor #f5c518 does not meet WCAG AA contrast with white text (ratio: 1.8). Use a darker shade like #b8920e."
- This script runs as a `pre-deploy` npm script and in CI for the main repo's canonical practice.json.
- Practice fork instructions must include: "If the build fails with a contrast error, use a darker version of your primary color. WCAG AA contrast (4.5:1) is required for readability on all screens."
- Document in `docs/FORKING.md`: "Accessibility is non-negotiable. The contrast validator prevents you from shipping an inaccessible tool to your patients."

**Phase to address:** Phase 2 (practice.json validation tooling).

---

### C-3: Translation Requests Not Validated Against Published VEINES-QOL Instrument Translations

**Severity: High**

**What goes wrong:**
A bilingual physiotherapist submits a PR adding `messages/it.json` (Italian) because they want to use vqol with Italian patients. Their translation of the VEINES-QOL/Sym question items is a forward-translation of the English text, not the officially validated Italian translation. The scoring T-score norms are derived from normative populations who answered the English (or specifically validated) version. A patient answering a home-translated Italian version is answering a different instrument — their scores are not comparable to the published normative data or to scores obtained with the validated Italian version.

**Why it happens:**
Contributors are well-intentioned. The repo has a `CONTRIBUTING.md` section on adding translations. The contributor follows the process but doesn't know that clinical questionnaire translation requires back-translation, expert review, and normative validation — not just linguistic fluency.

**Warning signs:**
- A PR adding a new locale without citing the published validation paper for that locale's VEINES-QOL/Sym translation
- A new `messages/xx.json` with item text that differs from any published validation paper
- A contributor who is a clinical professional but not familiar with PRO instrument translation methodology

**Prevention:**
- `CONTRIBUTING.md` "Adding a Translation" section must include: "The VEINES-QOL/Sym questionnaire has been validated in specific languages. ONLY these validated translations may be added as new locales: [list]. Adding a locale requires: (1) citation of the published validation paper, (2) the item text sourced verbatim from that paper, (3) a note that the normative scoring constants are derived from the English/French validation and may not apply to this locale's population."
- CI check: When a new `messages/XX.json` file appears in a PR, CI must output a human-readable warning: "New locale added. Reviewer must confirm this locale has a published VEINES-QOL/Sym validation. See CONTRIBUTING.md."
- The VEINES-QOL/Sym instrument question text keys in `messages/*.json` must be prefixed with `veines_q_` or clearly namespaced. CI checks that `veines_q_*` keys are never modified by contributors without explicit maintainer approval (protect these keys via a CI diff check).
- Published validated locales for VEINES-QOL/Sym include: English, French, German, Spanish, Portuguese, Italian, Dutch — per Lamping 2003 and subsequent validation papers. The v1 decision to ship EN/ES/FR/DE is correct. Italian, Portuguese, Dutch are the legitimate v2 additions.

**Phase to address:** Phase 2 (i18n structure), Phase 4 (CONTRIBUTING.md).

---

### C-4: Fork Drift — Security Patches Don't Propagate to Deployed Practices

**Severity: Medium**

**What goes wrong:**
vqol v0.1 ships. A critical security vulnerability is found in `idb` v8 (hypothetical). ByteWorthyLLC patches and releases v0.2. But the 47 practices that forked at v0.1 are running the vulnerable version. They have no mechanism to learn about the update and no incentive to pull in the patch. Their forked `package-lock.json` pins the old version. Patients are theoretically at risk, though in practice local-only IndexedDB storage means the attack surface is narrow.

**Why it happens:**
OSS fork-and-host creates a permanent distribution problem. Every fork is a snapshot, not a subscription. Without a mechanism to push updates or notify forks, security patches are meaningless for deployed instances.

**Warning signs:**
- No security advisory channel in the GitHub repo
- FORKS.md lists 10+ practices with no mechanism to alert them
- `SECURITY.md` lacks a "fork security notification" process

**Prevention:**
- `SECURITY.md` must instruct forkers: "Watch this repository for security advisories by clicking Watch → Security Alerts in GitHub." Make this Step 1 of the fork-and-deploy checklist.
- Use GitHub Security Advisories (free) to publish CVEs. Every practice that watches the repo receives an email.
- For the app shell: use Dependabot on the main repo to catch dependency vulnerabilities early, then communicate patches via GitHub Releases with explicit "if you forked before [date], update [package] to [version] by editing package.json."
- The runtime dependency surface is narrow: idb, uPlot, Svelte/Preact, paraglide. Keep this list short and documented so practices know exactly what to audit.
- Quarterly: review `npm audit` on main repo. Tag minor releases with security patch notes.

**Phase to address:** Phase 4 (repo scaffolding, SECURITY.md, GitHub Advisory setup).

---

### C-5: Patient Confusion — Forked Clinic Site Looks Amateur vs. the Demo

**Severity: Medium**

**What goes wrong:**
A practice forks and deploys at `https://veinpractice.github.io/vqol`. They add their logo (a 48x48 JPEG that looks blurry at 2x) and their brand color (a mid-gray #888888 that makes buttons look disabled). Patients arrive, compare it to the GitHub Pages demo, and think the practice's version is broken. Patients are already skeptical of patient portals; a visually degraded experience increases abandonment.

**Why it happens:**
Practice staff are not designers. They know how to edit JSON, not how to prepare assets for a high-DPI display.

**Warning signs:**
- `logoUrl` pointing to a JPEG under 100KB at 48×48px
- `primaryColor` set to a gray or near-white value
- Logo file referenced in practice.json but hosted externally (link rots)

**Prevention:**
- `docs/FORKING.md` must include a "Visual Quality Checklist": (1) Logo should be SVG or PNG at ≥512×512px. (2) Use `logoBase64` for offline reliability — paste the output of `base64 -i logo.png`. (3) Test at 2× and 3× display density (iPhone 15, Pixel 8). (4) Primary color must have at least 4.5:1 contrast with white text (the build validator catches this).
- Add a `practice-validator` npm script that checks logo format (not JPEG for icons if SVG/PNG is available), minimum logo dimensions (≥192×192px), and color contrast in one command. Output a "Deployment readiness" pass/fail.
- The default `practice.json` in the repo must show an ideal example with a high-quality SVG placeholder logo and a deep, accessible primary color. It is a design template, not just a config file.

**Phase to address:** Phase 2 (practice.json tooling), Phase 4 (documentation).

---

## Category D: Viral OSS Launch Pitfalls

---

### D-1: Show HN Backfire from Missing Demo or False Claims

**Severity: Critical**

**What goes wrong:**
A Show HN post submitted without a live, working demo link gets a top comment: "The demo link goes to a 404." If the demo works but the README has inaccurate claims — "validated against 10,000 patients" (it's never been used at scale) — the second top comment is "this is a false claim." HN comments live in Google search results for years. The project never recovers.

**Why it happens:**
Launches happen before the demo is polished. Claims are made aspirationally, not descriptively.

**Warning signs:**
- Demo URL in README redirects to a GitHub 404
- README uses phrases like "used by thousands" or "clinically validated" without citations
- The demo shows placeholder "Lorem ipsum" data instead of realistic vein patient data

**Prevention:**
- Phase 4 must not complete unless the GitHub Pages demo is live, shows seeded realistic data (baseline score 74 → 6mo 61 → 1yr 51), and the trend chart renders without errors on mobile Safari.
- README claims must be verifiable and specific: "VEINES-QOL/Sym is a validated instrument published in Lamping et al. 2003 [doi]." Do not say "validated PRO tracker" without clarifying it is the instrument that is validated, not this particular implementation.
- Show HN post must be written before Phase 4 is done and reviewed against the actual demo. The title formula: "Show HN: Patient-owned VEINES-QOL/Sym tracker — no server, no fees, runs entirely in the browser." The first comment written by the author must explain the technical implementation and the personal operator context (Director of Operations at a vein center — this is the credibility anchor).
- Never post Show HN with karma < 100 on the posting account. Use an established account or build up karma with technical comments before launch day.

**Phase to address:** Phase 4 (demo must be verified before any launch post).

---

### D-2: Reddit Health Subreddit Moderation Bans

**Severity: High**

**What goes wrong:**
Posts to r/varicoseveins, r/vascular, r/lymphedema that look like product promotion get removed within hours by automoderators that flag posts with URLs + promotional language. "Here's a free tool I built" is borderline. "Here's my free app, fork it, visit the demo" is usually removed. Even genuine patient-utility posts get caught by spam filters if the account is new or the link is to a commercial-looking domain.

**Why it happens:**
Health subreddits are heavily moderated against medical misinformation and spam. An OSS tool from a domain ending in `.io` looks indistinguishable from a SaaS pitch to a moderation bot.

**Warning signs:**
- The Reddit post account was created less than 30 days before the post
- The post title contains words like "free," "launch," "tool," or the domain name in the first sentence
- The subreddit has explicit rules against self-promotion

**Prevention:**
- Use the author's personal Reddit account (Director of Operations at a vein center), not a new account. Establish presence in r/varicoseveins first by answering patient questions genuinely.
- Post in a "community resource" framing: "I work at a vein center. One thing patients struggle with is tracking how their symptoms improve after treatment. I built a free open-source tracker for this..." Focus on patient utility, not the technology.
- The demo link must go to `github.com/ByteWorthyLLC/vqol` — GitHub is trusted by Reddit's spam filters. Not `vqol.io` or any custom domain that looks like a product page.
- Before launch, message the subreddit moderators directly and explain the tool. Ask if a post is appropriate. Moderators who approve a post are advocates, not gatekeepers.
- r/varicoseveins has 200k+ members. Even a low-engagement post that's not removed plants the tool in search results for "varicose veins tracker" permanently.

**Phase to address:** Phase 4 (pre-launch community setup).

---

### D-3: Maintainer Burnout from 50-Practice Issue Queue

**Severity: High**

**What goes wrong:**
vqol ships, 47 practices fork and deploy. Each practice's designated IT contact files a GitHub issue when something doesn't work for their specific workflow. Issue queue reaches 120 items: 40% are "feature requests for things explicitly in the Out of Scope list," 30% are "my practice.json is invalid" (solved by the validator), 20% are "iOS Safari doesn't remind patients" (documented limitation), and 10% are legitimate bugs. The maintainer (Director of Operations at a vein center — a full-time non-engineering job) drowns. The issue queue becomes public evidence the project is unmaintained. Stars stop coming. The project dies.

**Why it happens:**
OSS success creates a support obligation that individual maintainers cannot sustain without infrastructure. Most issues are user error, not bugs.

**Warning signs:**
- Issue queue > 20 open items
- Majority of issues are questions, not bugs
- Same questions recurring ("why doesn't iOS notify me?")

**Prevention:**
- Before launch, write exhaustive documentation for the Top 5 predictable issue categories: (1) practice.json validation errors, (2) iOS notifications require Home Screen install, (3) data disappears on iOS (7-day rule), (4) how to enable aggregate submit, (5) how to add a new language. Link these from the issue templates.
- Issue templates must include a checklist: "Have you read the FAQ?" with a mandatory checkbox. GitHub will not prevent submissions, but it signals to contributors that self-help is expected first.
- Use a `GitHub Discussions` category for "support questions" — route non-bug, non-feature issues there. Reserve the Issue tracker for confirmed bugs and accepted features.
- Add a `GOVERNANCE.md` that states clearly: "This project is maintained by one operator-author as a side project. Response times are best-effort. PRs that fix bugs are more likely to be merged than feature requests. If you need SLA-backed support, consider contributing to the project or sponsoring development."
- Set up a GitHub Discussion thread: "Known iOS Limitations — Please Read Before Filing an Issue." Pin it.

**Phase to address:** Phase 4 (pre-launch documentation and issue infrastructure).

---

### D-4: Outcomes Claims in Marketing That Imply Clinical Validation

**Severity: High**

**What goes wrong:**
README or LinkedIn launch copy says: "Practices using vqol show improved patient outcomes." Or: "Patients who track with vqol improve 18 points on average." These claims imply that the tool itself is clinically validated and effective. They are not true (at v0.1 with one deployment), and they cross into FDA territory for clinical efficacy claims if the tool is being characterized as improving outcomes.

**Why it happens:**
Marketing instinct says "show the result." The author genuinely believes the tool will improve outcomes (it probably will). But the claim requires clinical evidence that doesn't exist yet.

**Prevention:**
- Marketing copy must make claims about the instrument, not the tool: "VEINES-QOL/Sym is a validated instrument showing mean improvement of X points after treatment in published clinical trials [Lamping 2003 doi]." NOT "practices using vqol see X improvement."
- Permissible claim: "vqol implements the VEINES-QOL/Sym instrument exactly as validated in published literature, enabling practices to collect the same quality data as clinical trials."
- README review checklist in Phase 4 must include: "Do any claims imply the tool improves outcomes or has been clinically studied?" If yes, revise to attribute outcomes to the instrument, not the tool.

**Phase to address:** Phase 4 (README and launch copy review).

---

### D-5: Bus Factor 1 — Project Dies If Operator-Author Stops Shipping

**Severity: Medium**

**What goes wrong:**
The operator-author changes jobs, has a health issue, or simply moves on. The repo goes 8 months without a commit. GitHub shows "last commit: 8 months ago." The 47 practices still running their forks notice the inactivity. They stop recommending the tool to other practices. New forks stop. HN returns to find a dead project and flags it as abandoned. The cluster (postsclera, veinquest, etc.) loses the credibility anchor tool.

**Prevention:**
- `GOVERNANCE.md` invites co-maintainers explicitly: "If you have deployed vqol at your practice and want to become a co-maintainer, open a Discussion thread."
- The architecture and codebase must be genuinely approachable for new contributors. The ~1500 LOC budget, clean module boundaries, and extensive unit tests on the scoring engine make this achievable.
- Make it easy to be a low-commitment contributor: "Good first issue" labels, a `help-wanted` label for issues where a PR from anyone would be immediately merged.
- Consider a "steering committee" pattern even with 2-3 practices: any practice that has deployed for >6 months gets a voice in roadmap decisions. This distributes ownership.

**Phase to address:** Phase 4 (GOVERNANCE.md, issue labeling).

---

## Category E: PRO-Instrument-Specific Pitfalls

---

### E-1: Patients Answering Maximum Scores Without Reading (Ceiling Effect)

**Severity: Medium**

**What goes wrong:**
The VEINES-QOL/Sym has a 5-point Likert response scale for most items. Some patients — especially those who feel well post-treatment and are eager to show improvement — answer "5" (best) on every item without reading the question. This produces a ceiling score that is clinically meaningless and cannot show further improvement. The practice's aggregate data becomes polluted. A patient who answered all 5s at baseline cannot show improvement at 1yr even if their disease resolves completely.

VEINES-QOL specifically is susceptible because the symptom items (Q1) ask about frequency and severity — valid all-5 responses are possible for asymptomatic patients. But the psychological items (Q8) and activity limitation items (Q4/Q5) are less likely to all be maximum for any real patient.

**Warning signs:**
- Score of exactly 100 (T-score maximum) at baseline before any treatment
- All 25 items answered in under 30 seconds (timing attack detection)
- Two consecutive identical surveys with identical item-level responses

**Prevention:**
- Track time-per-question. If total survey completion time is under 45 seconds (estimated minimum for a thoughtful responder), flag the response as "completed unusually quickly — please review" on the results screen. Do not invalidate the score, but add a gentle prompt: "You completed the survey in under 60 seconds. Some questions may benefit from a second look."
- Present questions one at a time on individual screens (not as a scrollable list). This forces at least one interaction per question, adding friction that reduces mindless response.
- Do NOT add a "flag for clinical review" feature that sends data anywhere — this violates local-only architecture. The flag is displayed to the patient only.
- In practice documentation, note: "Extremely high baseline scores should prompt a clinical conversation about whether the patient understood the survey."

**Phase to address:** Phase 1 (survey UX design), Phase 3 (timing check implementation).

---

### E-2: Mid-Survey Abandonment — Partial Responses Are Worse Than No Response

**Severity: Medium**

**What goes wrong:**
A patient completes questions 1-18 of 25 and their phone goes into standby. They tap back to the app 20 minutes later. Two scenarios: (a) the browser killed the tab — survey state is lost, patient must start over, gets frustrated and quits. (b) The browser preserved the tab but the service worker updated in the interim, clearing the in-memory answers signal — same outcome.

For the VEINES-QOL/Sym scoring algorithm, missing items have a defined handling rule: if >20% of scored items are missing, the score cannot be computed. 7 missing items out of 25 is exactly 28% — over the threshold. A patient who completed 18/25 has no scoreable session, which is worse than no session (it pollutes the session history with a "failed score" entry).

**Why it happens:**
Life happens during a 5-10 minute survey. Mobile tab lifecycle management is aggressive. Surveyors design surveys assuming uninterrupted completion.

**Warning signs:**
- No IndexedDB draft-save on each question answer
- No resume capability in the app flow
- Session history shows entries with `score: null` (failed score due to missing items)

**Prevention:**
- **Mandatory**: Save each answer to IndexedDB immediately on selection (not on next-question tap). Store `{ sessionId, questionIndex, answersArray, startedAt, lastActivityAt }`. This is the B-1 prevention too — solve both with one mechanism.
- On app open, if an in-progress session exists that is less than 24 hours old, show "Continue your survey" as the primary CTA. If >24 hours old, show "Your last survey was interrupted — would you like to continue or start fresh?"
- Missing item handling: if the patient abandons mid-survey and later submits a partial session (via the resume flow), and >20% are unanswered, show: "Some questions were not answered. VEINES-QOL requires at least 20 of 25 answered items. Please complete the remaining questions." Only allow submission of surveys with ≤20% missing items.
- Session entry in IndexedDB has a `status` field: `"complete" | "in_progress" | "abandoned"`. The trend chart only shows `"complete"` sessions.

**Phase to address:** Phase 1 (survey state machine and IndexedDB draft-save).

---

### E-3: Score Interpretation Copy That Drifts into Clinical Advice

**Severity: High**

**What goes wrong:**
The results screen originally shows "Your score: 61." A well-meaning contributor adds "contextualizing" copy: "A score below 50 suggests significant quality-of-life impact from your venous disease." Another contributor adds a color-coded indicator: green/yellow/red based on T-score ranges. Now the app is making clinical inferences about severity. A patient with a score of 48 sees a red indicator and calls the practice in a panic. A separate patient with a score of 48 who actually has severe disease that has worsened sees a yellow indicator and does not seek care.

This also triggers the FDA SaMD risk identified in A-3: the app is now providing clinical interpretation, not just data recording.

**Why it happens:**
The UX pressure to "make scores meaningful to patients" is real. Patients do ask "is my 61 good?" Developers and designers try to answer this question in the interface.

**Warning signs:**
- Any color coding of score values (red/yellow/green)
- Text that includes words like "normal," "concerning," "significant impact," "mild/moderate/severe"
- A PR adding an interpretation guide or severity legend to the results screen

**Prevention:**
- Results screen copy must be strictly limited to: (1) the numeric score, (2) the change from prior score as a number and direction ("improved 13 points"), (3) the direction label ("higher is better"), and (4) the "share with your provider" CTA.
- The only contextualizing permitted: display the change magnitude with a published clinically meaningful difference threshold. VEINES-QOL's MCID (minimally clinically important difference) is approximately 5-7 T-score points per published literature. Showing "improved 13 points (above the 5-point threshold considered clinically meaningful)" is factual, cites published research, and does not interpret the patient's condition. Add the citation inline.
- This must be enforced architecturally: the results screen component accepts `{ score, priorScore }` only. No severity mapping, no color encoding, no thresholds are in the results component. The scoring module produces only a number. The interpretation limit is a design constraint, not a guideline.
- Add to `CONTRIBUTING.md`: "Score interpretation (severity labels, color coding, clinical recommendations) will not be merged. See the FDA SaMD section in docs/COMPLIANCE.md for the rationale."

**Phase to address:** Phase 1 (results screen design), Phase 4 (CONTRIBUTING.md and compliance docs).

---

### E-4: Reminder Fatigue Causes PWA Uninstall

**Severity: Medium**

**What goes wrong:**
The reminder schedule (1mo, 3mo, 6mo, 1yr) triggers a push notification at 9:00 AM on a Tuesday. The patient is in a meeting. The notification is dismissed. Three days later, another reminder fires (because the reminder logic fires every 3 days until the survey is completed). By the 4th reminder at day 12, the patient long-presses the notification and selects "Turn off notifications from this app." On iOS, this also removes home-screen PWA notification permissions permanently. The app is effectively dead for that patient.

**Why it happens:**
Reminder systems without acknowledgment tracking fire indefinitely. The developer tested "reminder fires" but not "reminder fires multiple times without being answered."

**Warning signs:**
- Notification scheduler fires based on `baselineDate + interval` without checking `hasReminderBeenAcknowledged`
- The reminder schedule does not have a "stop after N attempts" ceiling
- No test of the "patient dismisses notification 3 times" scenario

**Prevention:**
- Store in IndexedDB: `{ reminderId: "1mo", scheduledFor: Date, firedCount: number, acknowledged: boolean }`. After 2 notification fires for the same interval, stop. Mark as `abandoned` and show only an in-app banner.
- The in-app banner on next open is gentler than a push notification: "You're due for your 1-month follow-up survey." It remains on the home screen until the survey is completed or explicitly dismissed.
- Maximum 2 push notifications per interval window. After that, rely on in-app banner only.
- Document in README: "The app sends a maximum of 2 push notifications per scheduled interval. Patients who dismiss both will see an in-app reminder on next visit. No indefinite notification loops."

**Phase to address:** Phase 3 (notification scheduler implementation).

---

### E-5: Multi-Language Scoring Discrepancies

**Severity: High**

**What goes wrong:**
A Spanish-speaking patient answers the VEINES-QOL/Sym in the Spanish (`es`) locale. The T-score calculation uses the normative means and SDs from Lamping 2003, which were derived from English and French study populations. The published VEINES-QOL/Sym Spanish validation (if it exists) may have different normative constants for the Spanish-speaking population, or may use the same global constants. If the app uses non-validated scoring constants for the Spanish locale, the Spanish patient's scores are not comparable to published Spanish-language VEINES-QOL/Sym studies.

Separately: a patient who switches locale mid-session (answers Q1-Q10 in English, then changes locale to Spanish) has mixed-language responses that are unscoreable as a coherent instrument administration.

**Why it happens:**
The scoring engine is implemented once with Lamping 2003 constants and applied to all locales. The locale affects only what text is displayed — but if locale-specific normative constants exist and are not used, clinical comparability is degraded.

**Warning signs:**
- The scoring module has a single hardcoded normative constants object with no locale parameter
- Locale can be changed from the settings menu during an active survey
- Documentation does not specify which normative population the T-score is referenced against

**Prevention:**
- Research finding: The Lamping 2003 original paper and Kahn 2006 validation use English and French populations for normative data. Published Spanish validation (Monreal et al.) uses the same scoring algorithm and references the same normative constants — meaning the T-score constants are language-independent by design. This is the correct and safe assumption pending further review. Document this explicitly in `src/scoring/algorithm.md`: "T-score normative constants are from Lamping et al. 2003 English/French reference population. These constants are used across all supported locales consistent with published validation methodology."
- Locale-lock during active survey: once a survey session is started, the locale is locked until session completion. A `localeAtSurveyStart` field stored in the session prevents mid-survey locale switching. The locale selector is disabled or hidden on the survey route.
- Each stored session must record `locale: "en" | "es" | "fr" | "de"` alongside the score for any future population-specific analysis.
- If a practice adds an unsupported locale (e.g., Italian), the scoring engine must warn that normative constants have not been validated for this locale and scores should be interpreted with caution.

**Phase to address:** Phase 1 (scoring engine design), Phase 2 (locale-lock during survey).

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Empty string placeholder translations | Unblocks CI on new string | Silent blank labels in non-English locales; patient-facing breakage | Never |
| Bundling uPlot in initial JS chunk | Simpler build config | 47KB added to initial load; Lighthouse performance drops below 95 | Never |
| `registerType: 'autoUpdate'` without mid-survey guard | Easy setup | Patient loses survey answers when SW updates during survey | Never for this app |
| Storing answers only in memory, not IndexedDB | Simpler state management | Any tab close / SW update / iOS background kill loses survey progress | Never |
| History-mode routing on GitHub Pages | Cleaner URLs | Bookmarks and direct links 404 on static host | Never — always use hash routing |
| Skipping practice.json contrast validation | Faster fork setup | Accessibility failures in deployed forks; WCAG liability for practices | Never — validation is a 30-line script |
| Using `100vh` instead of `100svh` | Works on desktop | Submit button hidden behind iOS keyboard on full-screen survey | Never — use `100svh` with `100vh` fallback for old browsers |
| Bundling jsPDF instead of CSS print | Programmatic PDF possible | 230KB gzip kills Lighthouse score and first-load UX | Never at this bundle budget |
| Skipping instrument licensing email | Saves 2 weeks | DMCA takedown removes public repo and all fork deployments | Never — this is the only true launch-blocker |
| Adding analytics for usage insight | Owner can see adoption data | Any external request visible in DevTools destroys HN reputation permanently | Never — use GitHub star/fork counts as proxies |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Web Notifications API (iOS) | Scheduling `showTrigger` timestamps assuming they fire in background on iOS | iOS requires Home Screen install + iOS 16.4+. Notifications only fire during app session on iOS. Always implement in-app fallback reminder banner. |
| Web Notifications API (Android) | Using `new Notification()` from the window thread instead of `registration.showNotification()` | Android Chrome requires service worker `showNotification()` for notifications to fire when app is closed. Window-thread `new Notification()` is ephemeral. |
| IndexedDB via idb | Opening a second `openDB()` instance from a different module | Use a single exported `db` singleton from `storage/db.ts`. Multiple DB instances cause version conflict errors on first open. |
| practice.json via fetch | Fetching at every component mount | Fetch once at app boot in `branding/loader.ts`, store in signal. Gate first render on signal being non-null. All components read the signal. |
| CSS custom properties from practice.json | Applying colors via JavaScript inline styles per component | Set all brand tokens via `document.documentElement.style.setProperty()` at boot. Components reference `var(--color-primary)` only. |
| canvas to print/PDF | Calling `window.print()` before canvas renders | uPlot draws asynchronously. Wait for `chart.hooks.ready` before calling `canvas.toDataURL()`. Inject the data URL as `<img>` before print. |
| Service worker + injectManifest | Calling `clients.claim()` without a session-safety check | Add a check: if active client is on `/#/survey` route, defer `clients.claim()` until navigation away from survey. Prevents mid-survey session kill. |
| GitHub Pages + hash routing | Using history-mode routes (e.g., `/survey`) | GitHub Pages serves only `index.html`. Use hash routing (`/#/survey`) or configure a `404.html` that redirects. Hash routing is simpler and zero-config. |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| uPlot in initial bundle | Lighthouse performance < 95 on first load | Dynamic `import()` uPlot on `/` chart route only, not in app shell | From day 1 if not lazy-loaded |
| All locale JSON pre-loaded | Bundle grows ~8KB per locale (4 locales = 32KB overhead) | Paraglide tree-shakes per page. Verify with `vite-bundle-visualizer` that unused locale strings are excluded | On each locale added |
| IndexedDB open on every storage call | Multiple `openDB()` calls cause cascade version errors and slow reads | Singleton db instance exported from `storage/db.ts`, opened once at app mount | When storage module is imported from multiple components |
| practice.json fetched in component | Flash of unstyled content (FOUC) on every navigation | Fetch at boot, gate render on brand signal non-null | On every page navigation if not fixed |
| Eager import of PDF export | 230KB (CSS print) or 230KB jsPDF added to initial shell | Lazy-import in event handler only | First load if not deferred |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Aggregate endpoint over HTTP | Patient scores transmitted unencrypted; browser may block mixed-content anyway | Validate `aggregateEndpoint` is HTTPS in `practice-config/validate.ts`. Runtime rejection if HTTP. |
| External logo URL in practice.json that is not HTTPS | SW fetch blocks HTTP resources in HTTPS context | Validate `logoUrl` protocol in Zod schema. Prefer `logoBase64` in docs — immune to link rot and mixed-content issues. |
| Service worker intercepting IndexedDB | SW cannot access IndexedDB in most configurations; trying creates silent failures | Service worker handles fetch/cache events only. IndexedDB is accessed exclusively from the main thread. |
| postinstall scripts from npm dependencies | Malicious or accidental data exfiltration at install time | Run `npm audit` in CI. Review `postinstall` scripts of all direct dependencies before adding. Keep dependency count minimal. |
| Inline scripts in index.html | Content Security Policy violations; XSS surface | No inline `<script>` in `index.html`. All JS via Vite bundles. Set a strict CSP header in the GitHub Pages `_headers` file or Cloudflare Pages headers. |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Survey as scrollable single-page form | Patients scroll past questions without reading; ceiling effect amplified | One question per screen, navigation buttons only. Progress bar shows "Question 8 of 25." |
| Submit button below the fold on iOS with keyboard open | Patient cannot submit; thinks app is broken; abandons survey | `100svh` layout, submit button in fixed bottom bar above keyboard. |
| "Lower is better" axis on trend chart without explicit label | Patients see declining score and think their condition is worsening | Axis label must say "Higher score = better quality of life." Score direction is counter-intuitive and MUST be labeled on every chart view. |
| Notifications with no deep-link context | Patient taps notification, arrives at home screen with no cue why they were notified | Notification body: "Time for your 3-month VEINES-QOL follow-up." Deep-link to `/#/survey?remind=3mo` with the relevant interval. |
| PDF export that requires multiple taps to find | Patient forgets to share PDF; clinician has no data | "Export for your provider" CTA placed immediately after score reveal on results screen, above the fold, not in a menu. |
| Score displayed with 4 decimal places | Patients confused by "61.2847" | Round to 1 decimal place in display. Underlying storage retains full precision. |
| No "start over" option for patients who want to reset | Patients who moved between clinics or had data corruption cannot reset | Settings screen: "Clear all data and start fresh" with a two-step confirmation. This is a valid need for the rare patient who switches practice. |

---

## "Looks Done But Isn't" Checklist

- [ ] **VEINES scoring engine**: Verify with all published example inputs from Lamping 2003 and Kahn 2006 supplementary data — not just one test case.
- [ ] **iOS reminder behavior**: Must be manually tested with an actual iPhone, Home Screen install, and shortened reminder interval (set to 1 minute in test mode). CI cannot simulate this.
- [ ] **iOS Safari 7-day eviction**: Manually test: complete baseline survey in iOS Safari (no install), close all tabs, wait 8 days (or use Safari developer menu to advance storage clock), reopen link. Data must be shown as lost with a clear message, not as a silent empty state.
- [ ] **PDF export on iOS Safari**: Export must produce a readable one-page PDF. Canvas must appear, not a white box. Practice logo must render.
- [ ] **practice.json contrast validation**: Run `scripts/validate-contrast.ts` with a light color (#f5c518). Must fail with a human-readable message.
- [ ] **Aggregate submit HTTPS enforcement**: Set `aggregateEndpoint: "http://example.com"` in practice.json. The app must refuse the submission and log a clear error message.
- [ ] **Translation key drift detection**: Add a key to `en.json` only. The build must fail with a missing-key error (not silently pass).
- [ ] **Telemetry audit**: `grep -r "fetch\|beacon\|analytics" dist/` must return zero results (excluding the aggregate submit conditional path).
- [ ] **Mid-survey SW update**: Start a survey, simulate a SW update (trigger in Chrome DevTools → Application → Service Workers → skipWaiting). Survey progress must be preserved from IndexedDB and resume correctly.
- [ ] **WCAG AA**: Lighthouse a11y ≥ 95 on a mobile viewport with the deployed production build, not dev server.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| DMCA takedown on item text | HIGH | (1) Remove verbatim item text immediately. (2) File GitHub counter-notice if licensed. (3) Release new version with item text replaced by reference links. (4) Notify all forks via GitHub Security Advisory. |
| iOS patient data loss (7-day eviction) | MEDIUM | Cannot recover data. Add install-to-home-screen prompt retroactively. Add session export (JSON download) to allow manual backups. Post advisory to GitHub Discussions. |
| Service worker bricks mid-survey sessions | LOW | Deploy hotfix with `registerType: 'prompt'`. Document in release notes. Data lost for affected sessions cannot be recovered — prompt for re-survey at next visit. |
| practice.json contrast failure post-deploy | LOW | Practice must update their `primaryColor` to a darker shade and redeploy. Provide a hex color calculator in docs. |
| Accidental telemetry merged via PR | HIGH | (1) Immediately remove the dependency from main. (2) Release a new version. (3) Write a public post-mortem in GitHub Discussions. (4) Add the library to a blocked-packages list in CI. (5) Notify FORKS.md practices to update. Reputation damage is the hardest part to recover. |
| Score interpretation copy crosses SaMD line | MEDIUM | Remove the interpretation copy. Release a new version. If FDA inquiry occurs, demonstrate the revision was made promptly and the tool never received 510(k) clearance because it is excluded under Section 520(o). |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| A-1: Instrument licensing | Phase 0 (pre-commit gate) | Written email reply from LSHTM or legal opinion filed before public push |
| A-2: HIPAA edge cases | Phase 2 + Phase 5 | PRIVACY-COMPLIANCE.md published, aggregate submit has HTTPS guard |
| A-3: FDA SaMD copy drift | Phase 1 + Phase 4 | Results screen has no severity/interpretation copy; README claims are instrument-attributed |
| A-4: State privacy laws | Phase 2 | Privacy docs include state law section |
| A-5: Patient self-tracking liability | Phase 1 + Phase 3 | Onboarding disclaimer exists; results screen has "share with provider" CTA |
| A-6: Fork aggregate BAA confusion | Phase 2 + Phase 5 | SECURITY.md has BAA section; aggregate endpoint validation enforces HTTPS |
| B-1: SW update bricks survey | Phase 1 + Phase 3 | IndexedDB draft-save on each answer; SW uses prompt not autoUpdate |
| B-2: iOS 7-day storage eviction | Phase 1 + Phase 3 | navigator.storage.persist() called; install prompt shown post-baseline |
| B-3: iOS PWA quirks | Phase 1 | `100svh` used, canvas print-safe, Share API called directly from event handler |
| B-4: Lighthouse score drift | Phase 4 | Exact dependency versions pinned; Lighthouse threshold set correctly in CI |
| B-5: Accidental telemetry | Phase 1 + Phase 4 | CI network call audit on built output from day 1 |
| B-6: Print CSS inconsistency | Phase 3 | Canvas converted to img before print; tested in Chrome, Firefox, iOS Safari |
| B-7: i18n key drift | Phase 2 + Phase 4 | CI grep for empty strings; paraglide allowEmptyMessage: false |
| C-1: practice.json validation gaps | Phase 2 | ajv-cli validate runs in CI; Zod produces field-specific error messages |
| C-2: Brand color contrast failures | Phase 2 | contrast validation script runs in CI and as pre-deploy check |
| C-3: Unvalidated translation contributions | Phase 2 + Phase 4 | CONTRIBUTING.md requires validation citation; CI warns on new locale files |
| C-4: Fork drift / security patches | Phase 4 | SECURITY.md watchlist instructions; Dependabot on main repo; GitHub Advisories configured |
| C-5: Amateur-looking fork | Phase 2 | FORKING.md quality checklist; practice-validator script |
| D-1: Show HN backfire | Phase 4 | Demo verified live, claims are instrument-attributed, post reviewed against demo |
| D-2: Reddit moderation ban | Phase 4 | Subreddit moderator pre-contact, established account used, GitHub link not custom domain |
| D-3: Maintainer burnout | Phase 4 | GitHub Discussions support routing, GOVERNANCE.md, pinned iOS limitations thread |
| D-4: Outcomes claims drift | Phase 4 | README marketing copy review checklist run before launch |
| D-5: Bus factor 1 | Phase 4 | GOVERNANCE.md co-maintainer invitation, good-first-issue labeling |
| E-1: Ceiling effect / all 5s | Phase 1 | One question per screen; completion-time flag if under 45 seconds |
| E-2: Mid-survey abandonment | Phase 1 | Draft-save to IndexedDB on each answer; resume CTA on app open |
| E-3: Score interpretation copy drift | Phase 1 + Phase 4 | Results component accepts only score + delta; CONTRIBUTING.md anti-feature documented |
| E-4: Reminder fatigue | Phase 3 | Max 2 notifications per interval window; acknowledged flag stored in IndexedDB |
| E-5: Multi-language scoring discrepancy | Phase 1 + Phase 2 | Scoring algorithm.md documents normative population; locale locked during survey |

---

## Sources

- WebKit Storage Policy (7-day eviction, installed PWA exemption): https://webkit.org/blog/14403/updates-to-storage-policy/
- MDN Storage Quotas and Eviction Criteria: https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
- FDA 21st Century Cures Act Section 3060 Software Exclusions: https://www.fda.gov/regulatory-information/search-fda-guidance-documents/changes-existing-medical-software-policies-resulting-section-3060-21st-century-cures-act
- FDA General Wellness Policy (Low Risk Devices): https://www.fda.gov/regulatory-information/search-fda-guidance-documents/general-wellness-policy-low-risk-devices
- HHS HIPAA & Health Apps: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html
- HHS Mobile Health Apps (access right, covered entity): https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/access-right-health-apps-apis/index.html
- FTC Mobile Health Apps Interactive Tool: https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
- EU MDR MDSW Guidance (software as medical device): https://health.ec.europa.eu/medical-devices-topics-interest/software-and-apps_en
- vite-plugin-pwa autoUpdate strategy and race condition: https://vite-pwa-org.netlify.app/guide/auto-update.html
- vite-plugin-pwa service worker strategies: https://vite-pwa-org.netlify.app/guide/service-worker-strategies-and-behaviors
- Lamping DL et al. VEINES-QOL/Sym development and validation. J Vasc Surg. 2003
- Kahn SR et al. VEINES-QOL/Sym for DVT. J Clin Epidemiol. 2006 — https://www.jclinepi.com/article/S0895-4356(06)00051-5/abstract
- VEINES-QOL/Sym questionnaire PDF (JVS Venous supplementary): https://www.jvsvenous.org/cms/10.1016/j.jvsv.2019.08.014/attachment/4388b433-4947-48c1-908b-da9edb2da339/mmc1.pdf
- EFF Open Source Legal resources: https://www.eff.org/issues/intellectual-property
- GDPR Healthcare — special category data (Article 9): https://gdpr-info.eu/art-9-gdpr/
- European Health Data Space: https://www.ga4gh.org/news_item/the-european-health-data-space-from-approval-to-national-implementation/
- Response bias and ceiling effects in PRO surveys (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC1464019/
- Linguistic validation of clinical questionnaires: https://www.facit.org/translation-linguistic-validation
- Fork drift in OSS: https://preset.io/blog/stop-forking-around-the-hidden-dangers-of-fork-drift-in-open-source-adoption/
- Show HN launch lessons: https://medium.com/@baristaGeek/lessons-launching-a-developer-tool-on-hacker-news-vs-product-hunt-and-other-channels-27be8784338b
- Print CSS cross-browser pitfalls: https://www.customjs.space/blog/html-to-pdf-issues/
- WCAG 2.5.8 target size: https://www.allaccessible.org/blog/wcag-258-target-size-minimum-implementation-guide
- HHS WCAG 2.1 AA healthcare mandate (2024): https://pilotdigital.com/blog/what-wcag-2-1aa-means-for-healthcare-organizations-in-2026/
- GitHub DMCA repository: https://github.com/github/dmca

---

*Pitfalls research for: vqol — static PWA VEINES-QOL/Sym patient-owned PRO tracker*
*Researched: 2026-04-25*
