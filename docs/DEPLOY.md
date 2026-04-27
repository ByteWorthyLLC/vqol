# Deploying vqol

vqol is a static app. The default practice deployment requires no backend, no database server, and no secrets.

## 1. Configure the Practice

Edit:

```text
public/practice.json
```

Required fields:

- `practiceName`
- `primaryContact`
- `branding`
- `locale`
- `features`

Run:

```bash
npm run check
```

## 2. Build

```bash
npm run build
```

The build output is written to `dist/`.

## 3. Preview

```bash
npm run preview
```

Use the preview URL to verify:

- Home screen loads.
- Practice name and colors are applied.
- Survey route works.
- Results route works after a completed survey.
- Print/PDF export opens the browser print dialog.
- `#/device` runs runtime checks and can download a JSON report.

## 4. Deploy

### GitHub Pages

The included GitHub Actions deploy workflow publishes `dist/` to GitHub Pages on pushes to `main` or `master`.

Repository settings required:

1. Settings -> Pages.
2. Source: GitHub Actions.
3. Push to `main` or `master`.

### Cloudflare Pages

Use:

```text
Build command: npm run build
Build output: dist
```

No environment variables are required.

## 5. Legal Gate

Before a public launch, confirm the status in:

```text
INSTRUMENT-LICENSE.md
```

If LSHTM permission has not been granted, keep placeholder item text or implement reference-only mode.

## 6. Device Checks

Before announcing a demo, open:

```text
https://your-deployment.example/#/device
```

Use the Device Lab to collect a JSON report and, for public testing, a prefilled
GitHub issue.

Still complete these checks on real devices:

- iPhone Safari: complete survey, view chart, export PDF.
- Android Chrome: complete survey and install PWA.
- Desktop Chrome and Firefox: print report.
- VoiceOver or NVDA: navigate survey and results.
