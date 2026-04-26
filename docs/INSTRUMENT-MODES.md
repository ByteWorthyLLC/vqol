# Instrument Modes

The repository currently separates system mechanics from instrument text.

`public/practice.json` declares the deployment mode:

```json
{
  "instrument": {
    "mode": "reference-only",
    "licenseStatus": "pending-permission",
    "rightsHolder": "LSHTM"
  }
}
```

## Reference-Only Mode

The public demo can show placeholder item prompts and full scoring mechanics
without shipping proprietary or permission-gated questionnaire wording. This is
the safe default for open demonstration, fork testing, and public review.

## Permissioned Instrument Mode

A practice or research group that has permission to use the VEINES-QOL/Sym item
text can replace the placeholder prompt translations in `messages/*.json`.
Scoring constants and answer scales remain in source control so forks can audit
behavior and regression-test changes.

## Alternate Instrument Mode

If permission cannot be obtained, the app shell can be reused for a different
patient-reported outcome instrument with compatible scoring and licensing. The
swap points are:

- `src/lib/survey/items.ts`
- `src/lib/scoring/algorithm.ts`
- `messages/*.json`
- `docs/PRIVACY-COMPLIANCE.md`
- `INSTRUMENT-LICENSE.md`

Any fork that changes the instrument should add new scoring tests before
publishing a clinical-facing deployment.
