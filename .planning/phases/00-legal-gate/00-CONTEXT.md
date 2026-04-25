# Phase 0: Legal Gate - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Mode:** Auto-generated (non-engineering phase)

<domain>
## Phase Boundary

Secure written permission for OSS verbatim distribution of VEINES-QOL/Sym item text from LSHTM, OR execute the documented fallback (reference-only mode). Either way, commit `INSTRUMENT-LICENSE.md` to the repo root crediting Lamping/Schroter/LSHTM with the published citations.

This phase is async and runs in parallel with Phase 1 development. Phase 1 proceeds with placeholder item text — only verbatim instrument text is the legal risk surface. Phase 4 (public-repo-go-public) has a hard gate on this phase's outcome.
</domain>

<decisions>
## Implementation Decisions

### Action ownership
- The LSHTM inquiry email is **drafted by the project** (`.planning/legal/lshtm-inquiry-email.md`) but **sent by Kevin Richards from his ByteWorthy email** — institutional ask requires a human sender
- Cite pack (`.planning/legal/cite-pack.md`) is a self-contained reference for the user to attach
- Fallback plan (`.planning/legal/fallback-plan.md`) names the path of least friction (reference-only mode) if permission denied or no response in 30 days

### What ships in this phase
- `INSTRUMENT-LICENSE.md` in repo root — credits Lamping/Schroter/LSHTM, primary citations, current licensing status, MIT scope vs out-of-scope, fallback posture, status log

### What does NOT ship in this phase
- Survey item text changes (Phase 1 owns that, with placeholder text)
- Scoring algorithm constants (Phase 1 owns that — uses placeholder constants approximating Kahn 2006 supplementary data until Scoring Manual confirmed)

### Claude's Discretion
All implementation choices for this phase are at Claude's discretion — pure documentation and licensing posture. The deliverable is one file.

</decisions>

<code_context>
## Existing Code Insights

No code touched in this phase — pure documentation.

Cluster context: this `INSTRUMENT-LICENSE.md` template will be copied (with edits per instrument) to postsclera, veinquest, stockingfit, veinmap if they bundle any other validated instruments.

</code_context>

<specifics>
## Specific Ideas

- Status log table at the bottom — every event timestamped, every action owner-named
- Fallback posture must be unambiguous so a forking practice knows where they stand if the upstream license never resolves
- Honor Donna Lamping (deceased) by name in the credits

</specifics>

<deferred>
## Deferred Ideas

- Reaching out to Mapi Research Trust as alternate licensing route (deferred to fallback-plan.md execution if Schroter doesn't have institutional authority)
- Exploring PROMIS Global-10 (NIH, public domain) as an additional bundled PRO instrument — that's a v2 cluster decision, not a vqol Phase 0 concern

</deferred>
