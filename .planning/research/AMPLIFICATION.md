# Amplification Research: Intellectual Curiosity First

Researched: 2026-04-26

## Source Signals

- Hacker News guidelines optimize for intellectual curiosity and ask users not to use HN primarily for promotion. For vqol, the launch angle should be a technical curiosity: "a patient outcomes tracker as a static local-first PWA," not "please star my healthcare app." Source: https://news.ycombinator.com/newsguidelines.html
- HN FAQ confirms Show HN is the place for personal work and has separate visibility mechanics. That makes the demo and first comment important; the post must survive on technical substance and comments, not vote solicitation. Source: https://news.ycombinator.com/newsfaq.html
- Reddit's spam policy forbids repeated or unsolicited mass engagement and tells builders to post authentic content in communities where they have a real interest. For vqol, this means patient/practice posts must lead with utility and moderator pre-contact, not a launch blast. Source: https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam
- GitHub supports custom repository social preview images, with recommended large image sizing and public-repo sharing behavior. vqol needs a social preview that explains "local-first patient outcomes PWA" visually. Source: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/customizing-your-repositorys-social-media-preview
- GitHub Discussions are a native place for project questions, answers, announcements, and community conversations. vqol should use Discussions for "share your fork," "request a translation," and "instrument licensing FAQ." Source: https://docs.github.com/en/discussions
- WebKit documents storage policy for localStorage, Cache API, IndexedDB, Service Worker, and related storage, including eviction conditions. That turns "install this PWA to protect local scores" into a real product education hook, not just a generic prompt. Source: https://webkit.org/blog/14403/updates-to-storage-policy/

## Operating Principle

This should be a viral project, but not because it is promoted hard.

The project should spread because technically curious people see it and want to inspect, fork, argue with, or reuse the pattern.

**Rule:** intellectual curiosity over promotion. Every launch artifact must answer one of these questions:

- How can a healthcare outcomes workflow run with no backend?
- What does patient-owned browser-local health data look like in practice?
- How far can a one-file clinic fork go?
- Can a serious clinical-adjacent workflow be small, inspectable, and offline-capable?
- What legal/product shape keeps a copyrighted PRO instrument useful without distributing unlicensed text?

Anything that reads like "marketing," "growth hack," or "please star this" is lower priority than a working curiosity artifact.

## Positioning Principle

The viral center is not "healthcare app." It is:

> A validated-outcomes workflow that runs as a no-backend, no-account, no-analytics static PWA, with patient-owned data and a one-file clinic fork.

That sentence has four spreadable hooks:

1. Technical weirdness: serious clinical workflow as static frontend only.
2. Trust weirdness: no backend, no account, no telemetry.
3. Fork weirdness: one JSON file turns it into a clinic-branded deployment.
4. Healthcare weirdness: outcome tracking without a SaaS platform.

## Curiosity Artifacts

### 1. Seeded Demo Mode

First visitor should see a fake patient score history immediately, with an obvious "Demo data" banner. This solves the cold-start problem where a new visitor otherwise has no chart until completing a survey.

Implementation shape:

- `#/results?demo=1` seeds in-memory demo scores only.
- Demo state never writes to real patient IndexedDB unless user clicks "Use demo data locally."
- README and social previews link to demo mode.

Curiosity value:

- Visitors can understand the system without completing a survey.
- Developers can inspect the fake-data path and see that it is separate from patient data.

### 2. Local-First Proof Panel

Add a visible "Privacy proof" panel in the demo/results screen:

- "No account"
- "No backend"
- "No analytics"
- "Scores stored in this browser"
- "Build audit checks for telemetry"

Implementation shape:

- Static panel, no runtime network inspection needed.
- Link to `scripts/audit-telemetry.ts` and `docs/PRIVACY-COMPLIANCE.md`.

Curiosity value:

- Developers get a concrete claim they can audit.
- Patients/practices get a simple privacy model without buried policy language.

### 3. One-File Fork Wizard

Make the white-label mechanic tangible:

- Side-by-side preview of `practice.json` and the branded app.
- Copy-ready `practice.json`.
- "Deploy in 5 minutes" checklist.

Implementation shape:

- A docs page or hidden `/#/fork` route.
- Validate colors live using existing contrast logic.

Curiosity value:

- "One JSON file to brand a clinical outcomes PWA" becomes an inspectable proof, not a slogan.

### 4. Waiting-Room QR Poster Generator

Generate a simple printable poster for practice waiting rooms:

- Practice name.
- QR code to deployment URL.
- Short patient instruction.
- Privacy note: scores stay on device unless exported.

Implementation shape:

- Static route that renders a print-only poster.
- QR generation uses the lightweight `qrcode` package in the browser and renders a print route.

Curiosity value:

- Makes the software feel like something a real clinic could use tomorrow.
- Creates a physical artifact that bridges GitHub and waiting-room operations.

### 5. Shareable Score Receipt

Let patients create a non-PHI image/card after completing a survey:

- "I saved my vein treatment outcome score locally."
- Optional score hidden by default.
- Includes practice name only if configured.
- No diagnosis, no severity, no clinical interpretation.

Implementation shape:

- Canvas/SVG export or print card.
- Explicit "Do not include health details" default.

Curiosity value:

- Tests the boundary between shareability and privacy.
- Makes the local-first health-data story concrete without exposing PHI by default.

### 6. Offline Challenge

Make offline capability demonstrable:

- "Turn on airplane mode, reload, and your score history still works."
- Add a README badge/checklist, not necessarily runtime code.

Implementation shape:

- Manual test documented in release checklist.
- Could later add an in-app "Offline ready" status from service worker registration.

Curiosity value:

- A concrete proof of the no-backend claim that anyone can test.

### 7. Calendar Follow-Up Export

Offer `.ics` downloads after baseline for 1mo, 3mo, 6mo, and 1yr follow-ups.

Implementation shape:

- Generate local calendar files; no server.
- Works even when browser notifications are unreliable.

Curiosity value:

- A practical workaround to mobile PWA notification limitations.
- Useful even for skeptical users who do not install PWAs.

### 8. Reference-Only / Licensed-Instrument Switch

Make the legal gate a product feature:

- Full mode: only when permission is recorded.
- Reference-only mode: no copyrighted item text in repo.
- Bring-your-own-instrument mode: practice supplies licensed item JSON.

Implementation shape:

- `instrument.mode` in config.
- Example schema with placeholder text.
- Runtime warning when real text is absent.

Curiosity value:

- Turns a legal constraint into an architecture pattern.
- Makes the repo useful even if LSHTM says no.

### 9. Fork Registry + Map

Turn `FORKS.md` into a visible social-proof artifact:

- Listed practice deployments.
- Region, URL, optional "reference-only/full mode."
- Optional static map later.

Implementation shape:

- Start as Markdown.
- Later generate JSON from `FORKS.md` for README badges or a map.

Curiosity value:

- Every deployment becomes an inspectable proof point.

### 10. Weird Lab Route

Add a demo-only route for playful, non-clinical experiments:

- `/#/lab`
- Fake patient timeline generator.
- "Local-first proof" cards.
- One-file fork preview.
- QR poster preview.

Rules:

- Must be clearly demo/fake.
- Must not alter clinical results flow.
- Must not add interpretation or gamified patient scoring.

Curiosity value:

- Gives developers something fun to poke without polluting patient UX.
- Keeps weirdness in a clearly fake-data sandbox.

## Curiosity Artifact Requirements

Phase 4 needs these concrete artifacts before any channel copy:

1. Seeded demo URL with fake score history.
2. Visible local-first proof panel.
3. One-file fork proof using `practice.json`.
4. Offline challenge documented and testable.
5. Reference-only/licensed-instrument mode documented as an architecture pattern.
6. Waiting-room QR poster prototype.
7. README hero screenshot with fake data.
8. 5-8 second demo GIF showing seeded demo -> chart -> export report.
9. Social preview image: "Patient outcomes. Static PWA. No backend."
10. GitHub Discussions seed posts that invite technical questions:
   - Welcome / what this is
   - How local-first storage works
   - Reference-only instrument mode
   - Share your practice fork
   - Request a translation
   - Instrument licensing FAQ

## Channel-Specific Framing

### Hacker News

Frame as technical curiosity:

> Show HN: vqol - patient outcomes tracking as a no-backend static PWA

First comment should focus on:

- The strange constraint: static files only.
- Operator problem.
- Why static/local-first.
- Why no analytics.
- Instrument licensing caveat.
- What feedback is useful.

Avoid:

- Vote solicitation.
- "Healthcare disruption" language.
- Outcome claims about vqol itself.

### Reddit

Use utility and lived-operator framing, not launch framing:

- Ask moderators before posting.
- Participate before linking.
- Post different content per community.
- Lead with "I run operations at a vein practice and built a local-only tracker" rather than "we launched."
- Prefer posts that share the technical/privacy pattern or the printable clinic artifact over posts asking people to try the app.

### GitHub

Make repository itself conversion-optimized:

- Clear README.
- Demo link above fold.
- Social preview image.
- Topics.
- Discussions.
- Issue templates.
- Releases.
- FORKS registry.

## Safety Constraints

Do not add:

- Clinical interpretation.
- Severity labels.
- Score color coding.
- Streaks, leaderboards, or competitive patient mechanics.
- Public share cards with default score/condition details.
- Telemetry or analytics.
- Real instrument text/constants before permission.

## Recommended Phase 4 Priority Order

1. Seeded demo mode.
2. Local-first proof panel.
3. One-file fork wizard.
4. Offline challenge.
5. Reference-only/licensed-instrument mode.
6. QR poster generator.
7. Calendar follow-up export.
8. Weird lab route.
9. README screenshot/GIF/social preview generated from the above.
10. Channel copy only after artifacts exist.

## Copy Rule

Every public sentence should pass this test:

> Would a technically curious person still care if there were no call to action?

If not, cut it or rewrite it around a constraint, proof, implementation detail, or failure mode.
