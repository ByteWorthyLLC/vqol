# Concerns

## Launch Blockers

- LSHTM permission for item text and normative constants is not resolved.
- Real-device PDF, PWA install, native print, and screen-reader reports are still pending.
- v0.1.0 release should wait for legal posture and device evidence.

## Product Risks

- Placeholder item text and placeholder constants mean the app should not be marketed as a full VEINES implementation yet.
- Reminder UX is structurally present but not fully exercised on mobile platforms.
- PWA manifest uses generic app naming; practice-specific install branding would require more than `practice.json`.

## Technical Debt

- No ESLint or Prettier config.
- Physical-device evidence is report-driven through `#/device`, not automatically closed.

## Safety Watchpoints

- Do not add clinical interpretation copy.
- Do not add severity colors.
- Do not add telemetry.
- Do not commit real instrument text/constants until permission is recorded.
