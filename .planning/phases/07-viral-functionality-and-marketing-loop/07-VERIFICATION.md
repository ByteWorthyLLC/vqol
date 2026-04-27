# Phase 07 Verification

## Automated

Passed on 2026-04-27 after Launch Kit and SW update prompt changes:

```bash
npm run verify
```

Coverage:

- Svelte type checks.
- Contrast validation.
- Translation key alignment.
- Vitest: 14 files, 67 tests, including Launch Kit unit tests.
- Production build.
- Telemetry audit.
- Dependency audit.

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

Note: an already-open browser controlled by the pre-Phase-7 service worker can
still show the old shell until it refreshes. The new deployed shell now renders a
deferable update prompt for future releases.
