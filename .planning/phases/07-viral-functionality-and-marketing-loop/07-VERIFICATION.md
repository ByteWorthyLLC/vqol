# Phase 07 Verification

## Automated

Passed on 2026-04-27 after Device Lab changes:

```bash
npm run verify
VQOL_DEVICE_BASE_URL=http://127.0.0.1:4173/ npm run smoke:devices
VQOL_CAPTURE_BASE_URL=http://127.0.0.1:4173/ npm run assets:launch
npm run smoke:devices
npm run assets:launch
```

Coverage:

- Svelte type checks.
- Contrast validation.
- Translation key alignment.
- Vitest: 15 files, 71 tests, including Launch Kit and Device Lab report unit tests.
- Production build.
- Lighthouse accessibility: home 95%, demo result 96%, lab 95%, studio 96%,
  forge 95%, launch 95%, proof 95%, poster 95%, device 96%.
- Telemetry audit.
- Dependency audit.
- Device smoke: desktop Chromium, Android-sized Chrome layout, and iOS-sized
  Safari layout each rendered launch, studio, forge, proof, device, fake demo,
  and print invocation.
- Launch screenshots/GIF regenerated with a Device Lab frame locally and again
  from the live GitHub Pages deployment.

## Manual Browser Smoke

Passed locally on 2026-04-27 at `http://127.0.0.1:5173/#/launch`:

- Open `#/launch`.
- Confirm readiness score renders.
- Confirm quick links render for studio, forge, proof, and poster.
- Confirm artifact selector and default artifact render.
- Confirm launch brief download action is present.
- Desktop and mobile viewport accessibility snapshots rendered the route.
- Route smoke still passed after adding the virtual PWA update-registration module.

## Deployment

Passed on 2026-04-27:

- Commit `3b502b4` deployed Launch Kit.
- Commit `72a5fe8` deployed the service-worker update prompt.
- GitHub Pages run `24971177393` completed successfully.
- Live `index.html` points at `assets/index-CvW7wtL-.js`.
- Live `sw.js` precaches `assets/index-CvW7wtL-.js` and
  `assets/workbox-window.prod.es5-BIl4cyR9.js`.
- Live bundle contains Launch Kit artifact strings and service-worker update
  prompt code (`NeedRefresh`, `sw-update`).
- Commit `caf7247` deployed Device Lab and app-link social preview metadata.
- Live `index.html` references `assets/index-Bbi3jpDw.js` and
  `assets/social-preview.png`.
- Live Device smoke passed against `https://byteworthyllc.github.io/vqol/`.

Note: an already-open browser controlled by the pre-Phase-7 service worker can
still show the old shell until it refreshes. The new deployed shell now renders a
deferable update prompt for future releases.
