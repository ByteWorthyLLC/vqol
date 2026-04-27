# Instrument License & Provenance

> The VEINES-QOL/Sym instrument bundled in this repository is the work of others.
> This document credits the instrument authors and documents the licensing posture.

## Instrument

**VEINES-QOL/Sym**. Venous Insufficiency Epidemiological and Economic Study Quality of Life and Symptom questionnaire.

A 26-item patient-reported outcome (PRO) instrument for chronic venous disease. The two scales are scored on a T-score metric (mean 50, SD 10, higher = better).

## Instrument Authors

- **Donna L. Lamping, PhD** (deceased). London School of Hygiene & Tropical Medicine (LSHTM); original developer
- **Sara Schroter, PhD**. Senior Researcher, BMJ; Honorary Assistant Professor, LSHTM; co-developer and co-author of the validation papers and Scoring Manual
- **Susan R. Kahn, MD, MSc**. McGill University; co-author of the validation paper that established T-score scoring

## Primary Citations

When citing the instrument or the scoring algorithm, use:

```
Lamping DL, Schroter S, Kurz X, Kahn SR, Abenhaim L.
Evaluation of outcomes in chronic venous disorders of the leg:
development of a scientifically rigorous, patient-reported measure
of symptoms and quality of life.
J Vasc Surg. 2003;37(2):410-419.
doi:10.1067/mva.2003.152
```

```
Kahn SR, Lamping DL, Ducruet T, Arsenault L, Miron MJ, Roussin A,
Desmarais S, Joyal F, Kassis J, Solymoss S, Desjardins L,
Johri M, Shrier I.
VEINES-QOL/Sym questionnaire was a reliable and valid disease-specific
quality of life measure for deep venous thrombosis.
J Clin Epidemiol. 2006;59(10):1049-1056.
doi:10.1016/j.jclinepi.2005.10.016
```

## Licensing Status

**As of 2026-04-27**: The permission inquiry for verbatim OSS distribution of the item text, validated translations, and scoring constants has been **sent** to Sara Schroter with LSHTM Research Data Management on CC. Written permission is **not yet granted**.

The original developer, Donna L. Lamping, is deceased (confirmed in the 2015 BMC Cardiovasc Disord paper PMC4531536). Sara Schroter is the surviving co-author and the current institutional contact for instrument-distribution requests. The Scoring Manual (Lamping & Schroter, LSHTM 2007) containing the per-item normative means and SDs is not publicly available and must be requested directly.

**Inquiry email draft, sent copy, and reference pack** are maintained in this project's planning directory: `.planning/legal/`.

### What this means for users of this repo

- **Forking practices**: You may use this software under the MIT License (see `LICENSE`), but the question text inside the survey is governed by the instrument-license terms set by LSHTM. Until written permission is recorded here, the `messages/` files ship with **placeholder text and a notice linking to the official VEINES-QOL/Sym questionnaire PDF** in the published JVS Venous supplementary materials.
- **Researchers**: Cite the primary papers above in any publication referencing scores produced by this tool.
- **Patients**: Your data stays on your device. This repo never sees it.

## Permitted under MIT (this repo's `LICENSE`)

- The application code (Svelte components, scoring engine without normative constants, storage layer, branding system, PDF export, etc.)
- The `practice.json` schema and white-label tooling
- Documentation, tests, build pipeline, CI workflows
- The `lib/` directory shared across the Vein and Vascular cluster

## NOT permitted under MIT (subject to LSHTM permission)

- The verbatim 25 item-text strings of VEINES-QOL/Sym
- Validated translations of those item strings (EN, FR, IT, French-Canadian per Lamping 2003; DE per Tritschler 2014; NO per the 2009 paper; DA per the 2024 REDCap paper)
- The per-item normative means and SDs from the Lamping 2003 sample (the "Scoring Manual" constants)

## Fallback Posture

If permission is denied or unanswered for >30 days, the project ships in **reference-only mode** per `.planning/legal/fallback-plan.md`:

- The application code remains MIT-licensed and fully functional as a generic PRO framework
- Item text fields display placeholder copy with a link to the official LSHTM/JVS Venous PDF
- Scoring functions accept user-uploaded constants from a `scoring-constants.json` file that each forking practice provides under their own institutional licensing relationship

This keeps the entire application architecturally complete and shippable while leaving the instrument-content question to the deployer.

## Status Log

| Date | Event | Owner |
|---|---|---|
| 2026-04-25 | Inquiry pack drafted (`.planning/legal/`) - email, cite pack, fallback plan | Project |
| 2026-04-27 | LSHTM inquiry sent to `sschroter@bmj.com`; CC `researchdatamanagement@lshtm.ac.uk`; sent copy saved at `.planning/legal/lshtm-inquiry-sent-2026-04-27.md` | Kevin Richards |
| TBD | LSHTM response received | Kevin Richards |
| TBD | INSTRUMENT-LICENSE.md updated with permission outcome | Project |

---

*This document is required reading before any v1.0 public release. The MIT `LICENSE` for the codebase does NOT extend to the instrument content listed under "NOT permitted under MIT".*
