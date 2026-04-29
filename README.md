<div align="center">
<img src="https://raw.githubusercontent.com/ByteWorthyLLC/vqol/main/.github/assets/vqol-hero.svg" alt="vqol — VEINES-QOL/Sym tracker" width="100%">

# vqol

**Patient-owned VEINES-QOL/Sym tracker. Static, local-first PWA. No account, no telemetry.**

[![License](https://img.shields.io/badge/license-MIT-2563EB?style=for-the-badge&labelColor=0F172A)](./LICENSE)
[![Live demo](https://img.shields.io/badge/try_it-live_demo-2563EB?style=for-the-badge&labelColor=0F172A)](https://byteworthyllc.github.io/vqol/)

[**Try the demo →**](https://byteworthyllc.github.io/vqol/) &nbsp;·&nbsp; [Results demo](https://byteworthyllc.github.io/vqol/#/results?demo=1) &nbsp;·&nbsp; [Fork for your practice →](#practice-setup)
</div>

---

> **vqol** is a static, installable PWA that tracks longitudinal VEINES-QOL/Sym scores and exports a clinician-ready report. Patient data lives in the browser — no account, no backend, no telemetry. Fork and deploy for your vein practice in minutes.

## For patients

vqol guides you through a one-question-per-screen survey, tracks your score history over time, and lets you export a print-ready report to share with your care team. Everything stays in your browser. There is no account to create, no data sent anywhere, and a one-tap wipe removes everything if you choose.

- One-question-per-screen survey with draft resume support
- Score history as a longitudinal chart
- Print/PDF export through the browser print dialog
- Works offline after the first load (PWA)
- Four languages: English, Spanish, French, German

## For practices

Fork the repo, edit one file, and deploy. The app uses `public/practice.json` for all clinic-specific configuration — name, logo, contact info, brand colors, and locale selection. No code changes required for a standard deployment.

## Privacy

Patient data is stored in browser IndexedDB only. Nothing is transmitted, logged, or shared. Export is patient-initiated through the browser print dialog. One-tap wipe removes all local data. No analytics, no third-party scripts, no telemetry of any kind.

## Practice setup

```bash
git clone https://github.com/ByteWorthyLLC/vqol
cd vqol
# Edit public/practice.json with your practice name, logo, and contact info
npm install && npm run dev
# Deploy: push to GitHub → enable Pages → done
```

`public/practice.json` controls:

- Practice name and logo path
- Contact details
- Brand colors
- Available locales
- Aggregate submission feature flags (off by default)

Validate config and translations:

```bash
npm run check
```

## Deploy

[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-181717?style=for-the-badge&logo=github)](https://docs.github.com/en/pages)
[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=for-the-badge&logo=cloudflare)](https://deploy.workers.cloudflare.com/?url=https://github.com/ByteWorthyLLC/vqol)
[![Deploy to Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=for-the-badge&logo=netlify)](https://app.netlify.com/start/deploy?repository=https://github.com/ByteWorthyLLC/vqol)
[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/new/clone?repository-url=https://github.com/ByteWorthyLLC/vqol)

All four platforms support static site deployment at no cost on free tiers.

## Instrument note

The VEINES-QOL/Sym instrument text requires licensing from LSHTM for published deployments. The app ships with placeholder item text. See [INSTRUMENT-LICENSE.md](INSTRUMENT-LICENSE.md) before publishing a public deployment.

## Stack

Vite + Svelte, IndexedDB, uPlot charts, service worker, PWA manifest. No backend. No build-time data fetching. Static files only.

## Verification

Run the full local gate:

```bash
npm run verify
```

Runs: `svelte-check`, contrast validation, translation key validation, Vitest, production build, Lighthouse accessibility checks, telemetry signature audit, and dependency audit.

## Project structure

```text
src/
  lib/
    chart/        uPlot trend chart
    scoring/      item metadata, constants, scoring algorithm
    storage/      IndexedDB wrapper
    survey/       survey item metadata
    i18n/         locale loading and translation helper
    pdf/          print/PDF export helper
    practice-config/  practice.json validation and branding
  routes/         Home, Survey, Results, supporting route components
messages/         en/es/fr/de message files
public/           practice.json and PWA icons
scripts/          validation and audit scripts
docs/             operator docs
```

## License

The application code is MIT licensed. VEINES-QOL/Sym item text, validated translations, and normative scoring constants are separate instrument content and are not covered by this repository's MIT license unless permission is granted by the instrument rights holder.

Built by [ByteWorthy LLC](https://byteworthy.io).
