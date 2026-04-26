# Stack

## Runtime

- TypeScript
- Svelte 5
- Vite 6
- vite-plugin-pwa
- IndexedDB through `idb`
- uPlot for score history charting

## Testing and Validation

- Vitest with jsdom
- `fake-indexeddb/auto` for deterministic storage tests
- `svelte-check` for Svelte/TypeScript diagnostics
- Custom scripts:
  - `scripts/validate-contrast.ts`
  - `scripts/validate-translations.ts`
  - `scripts/audit-telemetry.ts`

## Deployment

- Static build output in `dist/`
- GitHub Pages workflow included
- Cloudflare Pages-compatible build: `npm run build`, output `dist`

## Deliberate Non-Dependencies

- No React/Preact runtime.
- No jsPDF or pdf-lib.
- No Chart.js.
- No Dexie.
- No analytics or error-monitoring SDK.
- No backend framework.
