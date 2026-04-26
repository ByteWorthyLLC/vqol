# Concerns

## Launch Blockers

- LSHTM permission for item text and normative constants is not resolved.
- Public remote is not configured in the local repo.
- GitHub Pages demo is not live.
- Real-device PDF and PWA checks are incomplete.

## Product Risks

- Placeholder item text and placeholder constants mean the app should not be marketed as a full VEINES implementation yet.
- Reminder UX is structurally present but not fully exercised on mobile platforms.
- PWA manifest uses generic app naming; practice-specific install branding would require more than `practice.json`.

## Technical Debt

- No Lighthouse CI integration yet.
- No ESLint or Prettier config.
- No seed-data demo mode.
- No SW update prompt UI despite `registerType: 'prompt'`.

## Safety Watchpoints

- Do not add clinical interpretation copy.
- Do not add severity colors.
- Do not add telemetry.
- Do not commit real instrument text/constants until permission is recorded.
