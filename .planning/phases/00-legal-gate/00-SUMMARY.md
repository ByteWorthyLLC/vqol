# Phase 0: Legal Gate - Summary

**Status:** Complete (deliverable shipped; async LSHTM response tracked separately)
**Completed:** 2026-04-25

## What Shipped

| Artifact | Location |
|---|---|
| `INSTRUMENT-LICENSE.md` | Repo root |
| LSHTM inquiry email draft | `.planning/legal/lshtm-inquiry-email.md` |
| Cite pack (instrument citations + commercial precedents + language matrix) | `.planning/legal/cite-pack.md` |
| Fallback plan (3 options + recommended path + 30-day follow-up checklist) | `.planning/legal/fallback-plan.md` |

## Requirements Satisfied

- LEGL-01: LSHTM licensing inquiry email drafted ✓ (send is user-owned async action)
- LEGL-02: Fallback strategy documented ✓ (executes if no response in 30 days)
- LEGL-03: INSTRUMENT-LICENSE.md committed to repo root ✓

## Open Async Items

| Item | Owner | ETA |
|---|---|---|
| Send LSHTM inquiry email to sschroter@bmj.com | Kevin Richards | TBD (user-owned) |
| Receive written response | LSHTM | 30-day window |
| Update INSTRUMENT-LICENSE.md status log on response | Project | Triggered by response |

## Phase 4 Gate Reminder

The public-repo-go-public action in Phase 4 has a hard gate on this phase's outcome:

- **If permission granted**: ship verbatim instrument text in v1.0
- **If denied or no response in 30 days**: ship in reference-only mode (placeholder text + link to JVS Venous PDF)

Phase 4 verification will check INSTRUMENT-LICENSE.md status log before tagging v0.1.0.
