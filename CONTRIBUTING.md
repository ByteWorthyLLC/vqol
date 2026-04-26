# Contributing

vqol is intentionally small. Contributions should preserve the static, local-only, fork-and-deploy model.

## Local Setup

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run verify
```

## Hard Rules

- Do not add telemetry, analytics, Sentry, Plausible, PostHog, Segment, Mixpanel, or similar tooling.
- Do not add accounts, login, hosted identity, or a backend dependency.
- Do not add clinical interpretation, severity bands, score color coding, diagnosis, or treatment guidance.
- Do not add third-party push notification services.
- Do not include copyrighted instrument text or normative constants unless `INSTRUMENT-LICENSE.md` records written permission.

## Translation Changes

All locale files in `messages/` must have identical keys and no empty strings. Run:

```bash
npm run check:translations
```

New VEINES-QOL/Sym item translations require documented validation provenance. Do not add ad hoc medical translations.

## Practice Branding Changes

Practice forks should edit `public/practice.json`. Validate with:

```bash
npm run check:contrast
```

## Pull Request Checklist

- Tests pass.
- Typecheck passes.
- Build succeeds.
- No telemetry signatures are introduced.
- Documentation is updated when behavior or setup changes.
- Instrument licensing constraints are respected.
