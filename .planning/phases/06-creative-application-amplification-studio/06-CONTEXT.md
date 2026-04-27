# Phase 6 Context: Creative Application Amplification Studio

Gathered: 2026-04-27

## Trigger

User feedback: the project still feels weak as a creative project and not yet
like a true application with meaningful functionality.

## Phase Boundary

Make the public demo more than a patient survey and proof page. Add local,
fake-data, operator-facing tools that are useful on their own and make the
static/local-first architecture worth exploring.

## Decisions

- Build application functionality, not launch copy.
- Keep all creative/weird surfaces fake-data or configuration-only.
- Do not alter real patient score history.
- Do not add analytics, account systems, clinical interpretation, severity
  labels, or backend dependencies.
- Prefer exportable artifacts because they make the app useful outside the app:
  CSV, protocol brief, `practice.json`, poster.

## Canonical References

- `src/App.svelte` — hash route registry.
- `src/routes/Lab.svelte` — lab index and amplification surface.
- `src/lib/fork/audit.ts` — fork-readiness checks.
- `src/lib/practice-config/validate.ts` — config validation.
- `docs/CURIOSITY-LAB.md` — public lab contract.
- `.planning/research/AMPLIFICATION.md` — curiosity-first strategy.

## Implementation Targets

1. Outcomes Studio:
   - deterministic fake cohort generator
   - cohort controls
   - protocol comparison
   - CSV export
   - protocol brief export

2. Practice Forge:
   - local `practice.json` builder
   - live validation
   - fork-readiness score
   - copy/download config

3. Documentation:
   - public docs for both tools
   - Phase 6 planning, summary, verification
   - requirements and roadmap updates

## Deferred

- Real cohort import/export.
- Hosted analytics dashboard.
- Social share image generator.
- GitHub social preview upload automation.
