# Outcomes Studio

The Outcomes Studio is a fake-data workbench at `#/studio`.

It turns vqol from a static demo into a small planning tool:

- Generate deterministic fake cohorts.
- Tune cohort size, follow-up completion, response lift, and variation.
- Compare the current synthetic protocol against a stronger follow-up protocol.
- Export fake patient-window rows as CSV.
- Export a plain-text protocol brief.

The studio never reads or writes patient IndexedDB records. It is only for
software testing, workflow planning, public demos, and discussion about
longitudinal outcomes collection.

Implementation:

- Simulation: `src/lib/studio/cohort.ts`
- Tests: `src/lib/studio/cohort.test.ts`
- Route: `src/routes/Studio.svelte`

The generated data is not clinical evidence and must not be represented as
practice performance.
