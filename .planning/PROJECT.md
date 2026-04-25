# vqol

## What This Is

A patient-owned VEINES-QOL/Sym tracker delivered as a static, installable PWA — the first open-source patient-facing PRO instrument tracker for vein/vascular care. Patients self-administer the validated quality-of-life survey at baseline, 1mo, 6mo, and 1yr after vein/vascular treatment, see their own improvement over time, and export their score history for clinician follow-ups. Vein practices fork the repo, drop in a `practice.json` with their branding, and deploy as a white-label patient tool that doubles as an outcomes-data engine.

Lives at `github.com/ByteWorthyLLC/vqol`. MIT-licensed. Built to spread.

## Core Value

A patient-facing, free, validated PRO instrument tracker that produces a real outcomes story for the practice — without requiring engineering, hosting, or per-response licensing fees that closed PRO platforms charge. The repo is the product: every star, fork, and deploy is distribution.

## Virality Strategy

vqol is built to be viral first, useful second. The viral mechanics:

| Surface | Mechanic |
|---|---|
| **HN / r/programming** | "Validated PRO instrument as a static PWA — no backend, no SaaS, no per-response fees" — devs love clean static-PWA replacements for $$$$ closed platforms |
| **r/varicoseveins / r/vascular / r/lymphedema** | Patients with chronic disease, no good tracking tools, underserved subreddits |
| **AVF / AVLS / ACP conferences** | Practice managers + surgeons who pay $5–10k/yr for closed PRO platforms — free OSS alternative spreads by word of mouth |
| **GitHub Pages demo** | One-click "see it work" with seed data → instant trust |
| **Fork count = social proof** | Each practice fork is a public deploy. Forks compound. |
| **Ship-list / Changelog cadence** | Public roadmap on GitHub, weekly progress posts on LinkedIn / X — operators love seeing momentum |

The repo must be **landing-page-quality** on first visit: hero README, animated demo GIF, "Deploy in 5 min" CTA, screenshot grid, before/after of fork-and-deploy. README is the marketing.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Product (the tracker):**
- [ ] Patient can take VEINES-QOL/Sym at baseline and at scheduled follow-up intervals (1mo, 3mo, 6mo, 1yr)
- [ ] Bundled scoring engine produces validated VEINES-QOL/Sym scores from responses (per published algorithm)
- [ ] Score history is stored locally in IndexedDB, never leaves the device unless the patient explicitly exports
- [ ] Patient sees a longitudinal trend chart of their own scores over time (lower-is-better axis is unambiguous)
- [ ] Patient can export their score history as a PDF for their clinician
- [ ] Web Notifications fire local reminders at 1mo / 3mo / 6mo / 1yr post-baseline
- [ ] App ships in 4 languages: English, Spanish, French, German (validated translations only)
- [ ] Single `practice.json` config controls per-practice branding (name, logo, colors, contact)
- [ ] Optional anonymous aggregate submission for practice-side analytics (opt-in, off by default in MVP)
- [ ] Deployable to GitHub Pages or Cloudflare Pages with zero backend
- [ ] First production deployment lives at user's own vein/vascular center

**Repo / virality:**
- [ ] MIT LICENSE in repo root
- [ ] README.md with hero copy, animated demo GIF, "Deploy in 5 minutes" CTA, screenshot grid, fork count badge, license badge, build-status badge
- [ ] Live demo on GitHub Pages with seeded fake patient data — first visitor sees the trend chart immediately
- [ ] CONTRIBUTING.md with PR template + how to add a translation
- [ ] CODE_OF_CONDUCT.md (Contributor Covenant 2.1)
- [ ] SECURITY.md with private vuln-report channel
- [ ] GitHub Actions CI: build + lint + typecheck + Lighthouse audit on PR
- [ ] GitHub Actions deploy: auto-publish to GitHub Pages on main
- [ ] Repo description, topics (vein, healthcare, pwa, pro-tracker, veines-qol, open-source-health), and social preview image set
- [ ] Public ROADMAP.md showing planned phases — operators love seeing momentum
- [ ] CHANGELOG.md following Keep a Changelog
- [ ] Issue templates: bug, feature, "deploy your practice" (so each fork gets visibility)
- [ ] GitHub Discussions enabled with seed posts (intro, "share your fork", "request a translation")
- [ ] Pushed to `github.com/ByteWorthyLLC/vqol` as public repo
- [ ] v0.1.0 GitHub Release tagged with download links + demo URL
- [ ] Hand-curated registry: `FORKS.md` listing every clinic that deploys (turns forks into social proof)

### Out of Scope

- Other vein PROs (CIVIQ-20, AVVQ) — could be v2 modules; v1 stays focused on the gold standard
- Multi-tenant hosted SaaS — defeats the fork-and-host moat AND kills the virality story
- Direct EHR integration — out of scope for a static PWA; PDF export is the bridge
- Diagnosis or interpretation beyond score calculation — explicit anti-feature; this is a tracker, not clinical advice
- Account systems, login, server-side identity — patient ownership of data is the privacy story
- Practice-side dashboard for cross-patient aggregate viewing in v1 — anonymous submit only; dashboard is v2
- Paid tier / Pro features — antithesis of the viral OSS thesis

## Context

- **Operator-built**: Author is Director of Operations at a real vein/vascular center. v0.1 ships at that practice. This is the unfakeable moat — random devs cannot replicate operator context.
- **Cluster member**: vqol is the first of five tools in the Vein and Vascular cluster (vqol → postsclera → veinquest → stockingfit → veinmap). Each shares the `practice.json` white-label pattern. vqol carries the fixed cost of nailing the pattern; later tools ship in days, not weeks.
- **Distribution thesis**: Practice owners hear about it via dev/HN distribution → fork → deploy → organic word-of-mouth among practice operators (AVF, AVLS, ACP conferences). Vein industry has no free, open patient-facing PRO tooling.
- **Closed competitors**: Outcomes MTM, Net Health, and other commercial PRO platforms charge per-response. No open-source patient-facing PRO tracker exists at the patient-data-ownership level.
- **Instrument provenance**: VEINES-QOL/Sym is published in peer-reviewed literature (Lamping et al., 2003) with validated translations across 8+ languages. Standard PRO licensing is generally permissive for non-commercial / clinical-practice use; commercial SaaS hosting may require permission.
- **Spec sources**: `IDEA.md` (in repo root) is the authoring spec. `CLUSTER-CONTEXT.md` (in repo root) gives the parent cluster rationale.

## Constraints

- **Tech stack**: Static PWA only — Vite + Preact + IndexedDB + chart.js (or uPlot) + jsPDF. ~1200–1800 LOC budget. Reason: fork-and-host requires zero backend; everything must run from a static host.
- **Hosting**: GitHub Pages or Cloudflare Pages — no server, no DB, no env secrets. Reason: "deployable in an afternoon by a vein practice manager" is the user-facing pitch.
- **Privacy**: All patient data local-only by default. No telemetry. No analytics. Anonymous aggregate submission is opt-in, off by default. Reason: patient-data-ownership is part of the differentiation story; one accidental leak kills the brand.
- **Licensing**: VEINES-QOL/Sym instrument license must be confirmed permissive for OSS patient-facing distribution before v1.0 release. Reason: the entire repo's value depends on bundling the validated instrument.
- **Accessibility**: Patient audience skews older (vein disease prevalence rises with age). UI must meet WCAG AA contrast, support large tap targets, and work with screen readers. Reason: real-world patient mix.
- **Effort budget**: 1–2 weeks to v0.1 deployable at the author's clinic. Reason: this is the lowest-risk tool in the cluster and must demonstrate the white-label pattern fast.
- **Repo home**: `github.com/ByteWorthyLLC/vqol` (public). Reason: ByteWorthyLLC is the studio brand for OSS work; signals "real software shop, not abandoned weekend project" and channels traffic to byteworthy.io.
- **License**: MIT. Reason: max permissive — the moat is operator context + brand, not source-code lockup. Practices and competitors can both fork; we win on continued shipping cadence.
- **Web commit signoff**: ByteWorthyLLC org enforces signed commits. All commits and releases must be signed.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static PWA over backend SaaS | Fork-and-host is the moat; backend kills that | — Pending |
| Preact over React | Smaller bundle, same DX, better fit for ~1500 LOC budget | — Pending |
| IndexedDB over localStorage | Photo / PDF blobs may be added later in cluster; future-proof now | — Pending |
| English/Spanish/French/German at v1 | Only languages with validated VEINES-QOL/Sym translations | — Pending |
| `practice.json` over UI-based admin | Forking devs config in code; non-technical clinic managers config via single file edit | — Pending |
| Anonymous aggregate submission opt-in, off by default | Privacy-first stance reduces brand risk; can flip default later if practice operators request | — Pending |
| MIT license over Apache-2.0 / AGPL | Max viral spread; moat is operator context + cluster shipping cadence, not code | — Pending |
| ByteWorthyLLC org over personal account | Studio-brand positioning, signals professionalism, channels to byteworthy.io | — Pending |
| GitHub Pages as canonical demo | Same provider as repo, free, fast, no DNS setup | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-25 after initialization*
