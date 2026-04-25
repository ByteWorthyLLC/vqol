# vqol

> A patient-owned VEINES-QOL/Sym tracker. Patient takes the validated quality-of-life survey at baseline, 1mo, 6mo, 1yr. Sees their own improvement over time. Practice gets aggregate outcomes data — a real differentiator.

## One-line pitch
The VEINES-QOL/Sym is the gold-standard patient-reported outcome instrument for chronic venous disease. It's validated across 8 languages and is the basis of nearly every published vein-treatment outcomes study. But there's no good patient-facing tool for it. This is a static page where patients self-administer at intervals, see their own trajectory, and can export their score history for follow-ups. Practice deploys a branded copy and aggregates anonymized scores for marketing + payer conversations.

## Why this matters operationally
- Most practices have ZERO outcomes data — they treat, but don't measure
- A practice that can say "our patients improve a mean of N points on VEINES-QOL at 6 months" has a referral and payer story no competitor has
- Free, validated PRO tool is a moat — most paid PROs cost per response
- Patient sees their own improvement = retention + referrals

## Engineering trick
- Static SPA — survey runs locally
- Bundled VEINES-QOL/Sym scoring algorithm
- Local data via IndexedDB; optional anonymized opt-in submit (NOT in MVP)
- Trend chart over baseline → 1mo → 6mo → 1yr
- Per-practice config for branding
- Multi-language support built-in (English, Spanish, French, German validated translations)

## Audience
- **Vein patients** — direct
- **Vein practices** — fork-and-deploy
- **Vascular surgery researchers** — could use as a recruitment tool
- **Devs** — clean PRO-instrument-as-a-static-tool template, replicable for other PROs

## The demo
30-second loop: patient lands on page, sees their own previous scores as a trend line (76 at baseline → 68 at 1mo → 58 at 6mo, lower is better) → "ready for your 1-year follow-up?" → 25-question survey, swipe interface → final card: "your score: 49 — you've improved 27 points since baseline (clinically significant)." → tap "share with doctor" → PDF.

## MVP scope
1. Static SPA with VEINES-QOL/Sym implementation
2. Validated scoring engine (published algorithm)
3. Reminder schedule (1mo, 3mo, 6mo, 1yr) via Web Notifications
4. Trend chart of scores over time
5. PDF export for clinician
6. Per-practice white-label config
7. Multi-language (en, es, fr, de)
8. Optional anonymous aggregate submission for practice analytics

## Public data
- VEINES-QOL/Sym is published in peer-reviewed literature; instrument is licensed for non-commercial use under standard PRO terms
- Validate licensing language on launch (likely free for non-commercial + clinical practice; commercial SaaS use may require permission)

## Out of scope (MVP)
- Other vein PROs (CIVIQ-20, AVVQ) — could be v2 modules
- Multi-tenant SaaS (defeats the fork-and-host model)
- Direct EHR integration

## Why it could flop
- Licensing on the instrument has to be clear before publishing — needs research
- Patients won't come back for a survey unless reminded well — reminder cadence matters
- Practices may not see the marketing-data play unless we make a "practice-side dashboard" mode obvious

## Differentiation
- No good open-source PRO tracker exists at the patient-facing level
- Closed-source PRO platforms (Outcomes MTM, Net Health) cost $$$$
- Patient-OWNED data is a privacy story too

## Stack
- Vite + Preact
- IndexedDB
- chart.js or uPlot for trend visualization
- jsPDF
- Cloudflare or GitHub Pages
- ~1200–1800 lines
