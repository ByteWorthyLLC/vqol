# Phase 07 Plan: Viral Functionality and Marketing Loop

## Goal

Make vqol easier to spread because it is useful, inspectable, and remixable.

## Scope

1. Add a functional Launch Kit route that generates practical marketing and
   sharing artifacts from real deployed routes.
2. Add a pure utility module with deterministic URL, rubric, artifact, and
   Markdown brief generation.
3. Connect the route from Home, Lab, and the top navigation.
4. Add tests for launch URL and artifact generation.
5. Add docs that define the viral functionality loop.
6. Add a GitHub issue template for weird functional experiments.
7. Update planning state, requirements, and roadmap.
8. Add a Device Lab route that converts real-device verification gaps into
   runtime/manual reports and prefilled GitHub issues.
9. Serve app-link social preview metadata from a deployable public asset.

## Acceptance Criteria

- `#/launch` works locally and produces a readiness score.
- Launch artifacts include technical, clinical, contributor, AI citation, and
  remix-loop outputs.
- Generated copy links to demo, proof, studio, forge, poster, and repo.
- A downloadable Markdown launch brief is available.
- `#/device` generates runtime/manual evidence, JSON report downloads, and
  prefilled issue URLs.
- App-link Open Graph/Twitter image is available from deployed static assets.
- Translation keys stay aligned.
- `npm run verify` passes.
