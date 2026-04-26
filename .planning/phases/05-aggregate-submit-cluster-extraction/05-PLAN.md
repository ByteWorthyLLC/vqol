# Phase 5 Plan: Aggregate Submit + Cluster Extraction

## Success Criteria

1. Aggregate submission is disabled by default.
2. Enabled aggregate submission posts only de-identified score events.
3. Insecure endpoints are rejected at config validation.
4. Example receiver exists.
5. Practice responsibility and BAA/retention caveats are documented.
6. Shared modules are documented well enough to extract later:
   - practice config
   - i18n
   - PDF/print export
   - aggregate submission
   - offline proof/status
7. First operator deployment is listed in `FORKS.md`.

## Execution

- Keep the patient flow local-first by default.
- Never submit questionnaire answers or contact details.
- Keep aggregate errors non-blocking for patient completion.
- Treat Phase 5 as reusable infrastructure, not dashboard scope.
