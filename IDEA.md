# vqol

> A patient-owned VEINES-QOL/Sym tracker. Patient takes the quality-of-life survey at baseline, 1mo, 6mo, and 1yr. Scores stay local by default, patients can export their own history, and practices get a forkable outcomes tool.

## One-line pitch
The VEINES-QOL/Sym is a major patient-reported outcome instrument for chronic venous disease and appears across published vein-treatment outcomes research. But there is no good patient-facing open-source tracker for it. This is a static PWA where patients self-administer at intervals, see their own trajectory, and export their score history for follow-ups. A practice deploys a branded copy and can later opt into anonymized aggregate outcomes under its own compliance model.

## Why this matters operationally
- Most practices have ZERO outcomes data. they treat, but don't measure
- A practice that can say "our patients improve a mean of N points on VEINES-QOL at 6 months" has a referral and payer story no competitor has
- Free, validated PRO tool is a moat. most paid PROs cost per response
- Patient sees their own improvement = retention + referrals

## Engineering trick
- Static SPA. survey runs locally
- Bundled VEINES-QOL/Sym scoring-engine shape, with real item text/constants gated by instrument permission
- Local data via IndexedDB; optional anonymized opt-in submit in a later phase
- Trend chart over baseline -> 1mo -> 6mo -> 1yr
- Per-practice config for branding
- Multi-language support built-in (English, Spanish, French, German validated translations)
- Device Lab for install, offline, PDF, notification, and screen-reader evidence reports

## Audience
- **Vein patients**. direct
- **Vein practices**. fork-and-deploy
- **Vascular surgery researchers**. could use as a recruitment tool
- **Devs**. clean PRO-instrument-as-a-static-tool template, replicable for other PROs

## The demo
30-second loop: patient lands on page, sees prior scores as a trend line (49 at baseline -> 57 at 1mo -> 64 at 6mo, higher is better) -> "ready for your 1-year follow-up?" -> one-question-at-a-time survey -> final card with current score, prior score, and delta with no clinical interpretation -> tap "Export report" -> browser print/PDF dialog.

## MVP scope
1. Static PWA with VEINES-QOL/Sym implementation shape
2. Scoring-engine shape with real constants gated by instrument permission
3. Reminder schedule (1mo, 3mo, 6mo, 1yr) via Web Notifications
4. Trend chart of scores over time
5. PDF export for clinician
6. Per-practice white-label config
7. Multi-language (en, es, fr, de)
8. Optional anonymous aggregate submission for practice analytics
9. Device Lab report loop for real-device verification

## Public data
- VEINES-QOL/Sym is published in peer-reviewed literature.
- Verbatim item text, validated translations, and normative constants remain gated by LSHTM/instrument permission. See `INSTRUMENT-LICENSE.md`.

## Out of scope (MVP)
- Other vein PROs (CIVIQ-20, AVVQ). could be v2 modules
- Multi-tenant SaaS (defeats the fork-and-host model)
- Direct EHR integration

## Why it could flop
- Licensing on the instrument has to be clear before publishing. needs research
- Patients won't come back for a survey unless reminded well. reminder cadence matters
- Practices may not see the marketing-data play unless the Outcomes Studio, Device Lab, and eventual practice-side dashboard make the operating value obvious

## Differentiation
- No good open-source PRO tracker exists at the patient-facing level
- Closed-source PRO platforms (Outcomes MTM, Net Health) cost $$$$
- Patient-OWNED data is a privacy story too

## Stack
- Vite + Svelte 5
- IndexedDB
- uPlot for trend visualization
- `window.print()` + print CSS for report export
- Cloudflare or GitHub Pages
- ~1200-1800 lines
