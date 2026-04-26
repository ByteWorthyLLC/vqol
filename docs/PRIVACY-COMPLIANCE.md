# Privacy and Compliance Notes

This document is not legal advice. It describes the default technical posture of vqol so practices can evaluate their own obligations.

## Default Data Flow

By default:

- Patient answers are stored in browser IndexedDB.
- Scores are stored in browser IndexedDB.
- Report export is initiated by the patient through the browser print dialog.
- vqol does not send patient data to ByteWorthy LLC.
- vqol does not include analytics, telemetry, Sentry, or third-party tracking.
- vqol does not require accounts or login.

## Practice Responsibility

A practice that forks and deploys vqol controls:

- The host.
- The configured practice branding.
- Any modified code.
- Any enabled aggregate endpoint.
- Any patient workflow around QR codes, links, exports, or clinical follow-up.

If a practice changes the architecture, adds data collection, or enables aggregate submission, that practice must perform its own HIPAA, state privacy, security, and Business Associate analysis.

## Business Associate Notice

ByteWorthy LLC is not a Business Associate for a default fork-and-deploy installation. ByteWorthy LLC does not operate the practice's deployment and does not receive patient data from the default app.

## Aggregate Submit

Aggregate submit is planned but off by default. If enabled later, it must remain:

- Explicitly opt-in.
- Practice-controlled.
- HTTPS-only.
- Free of direct patient identifiers.
- Documented in the practice's own privacy notice where required.

Practices in states with stricter consumer health privacy laws should review those laws before enabling any aggregate endpoint.

## Instrument Licensing

Privacy compliance is separate from instrument licensing. Read `INSTRUMENT-LICENSE.md` before public release or patient use.
