# FAQ

## Does vqol send patient data to ByteWorthy?

No. The default app stores sessions and scores in the patient's browser through IndexedDB. It has no backend and no analytics.

## Can my practice deploy a branded copy?

Yes. Fork the repo, edit `public/practice.json`, run `npm run verify`, and deploy the static `dist/` output.

## Is the VEINES-QOL/Sym instrument text included?

Not yet as cleared instrument content. The app currently uses placeholder item text and placeholder scoring constants until written permission is recorded in `INSTRUMENT-LICENSE.md`.

## Is this clinical advice?

No. vqol displays scores, deltas, history, and export controls. It does not diagnose, interpret severity, recommend treatment, or replace clinician judgment.

## Can this connect to an EHR?

Not in v1. PDF export is the clinical handoff path.

## Can a practice collect aggregate outcomes?

Yes, but not by default. Aggregate submit is implemented as an opt-in practice-owned feature and remains disabled in `public/practice.json`.

## How do we verify phones, tablets, print dialogs, and screen readers?

Open `#/device` on the target device. The Device Lab runs runtime checks, lets a tester record manual install/PDF/notification/screen-reader checks, downloads JSON evidence, and opens a prefilled GitHub issue.

## Why use `window.print()` instead of a PDF library?

PDF libraries add significant bundle size. The current report is an HTML print template with print CSS, which keeps the app small and works with browser save-as-PDF flows.
