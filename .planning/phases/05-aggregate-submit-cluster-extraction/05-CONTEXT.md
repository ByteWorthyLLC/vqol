# Phase 5 Context: Aggregate Submit + Cluster Extraction

## Goal

Make practice-owned aggregate collection optional, explicit, and reusable while
preserving the default local-first patient workflow.

## Baseline

Phase 5 started early because aggregate submission and supporting docs are small,
bounded, and help the repo prove the privacy model.

Implemented:

- `aggregateSubmit` remains false by default.
- HTTPS-only endpoint validation already existed.
- `practiceId` gives aggregate/calendar/fork artifacts stable IDs.
- `src/lib/aggregate/submit.ts` builds and submits de-identified score payloads.
- `examples/aggregate-receiver/worker.js` provides a minimal receiver.
- `docs/AGGREGATE-SUBMISSION.md` documents payload shape and practice
  responsibility.

Still pending:

- First operator deployment.
- Fork registry entry for a real operator.
- Extractable shared module docs for the future vein cluster package.
