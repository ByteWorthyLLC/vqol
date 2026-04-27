# Phase 6 Plan: Creative Application Amplification Studio

## Objective

Turn the demo into a creative local-first application by adding operator-facing
tools that are useful, inspectable, and safe.

## Wave 1: Synthetic Outcomes Studio

- [x] Add deterministic fake cohort generator.
- [x] Add summary and CSV export utilities.
- [x] Add protocol brief export.
- [x] Add `#/studio` route with controls and protocol comparison.
- [x] Add tests for deterministic generation, summary, CSV, and brief output.

## Wave 2: Practice Forge

- [x] Add config draft and serialization helpers.
- [x] Add `#/forge` route with live config validation.
- [x] Reuse fork audit for readiness scoring.
- [x] Add download/copy controls.
- [x] Add tests for draft/config transforms.

## Wave 3: Integration

- [x] Wire routes into `App.svelte`.
- [x] Promote Studio and Forge from the lab and home tools.
- [x] Add translation keys across all locale files.
- [x] Add public docs.
- [x] Update planning docs.

## Verification

- `npm run check`
- `npm test`
- `npm run verify`
- Browser inspection of `#/studio` and `#/forge`

## Safety Rules

- Synthetic data only.
- No writes to patient IndexedDB.
- No clinical conclusions.
- No default network path.
