# Practice Forge

The Practice Forge is a local `practice.json` builder at `#/forge`.

It makes the one-file fork promise operational:

- Edit practice name, slug, contact path, color, instrument mode, and aggregate
  submission settings.
- Preview the deployment identity.
- Validate the generated config with the same runtime validator as the app.
- Run the fork-readiness audit.
- Download or copy a usable `practice.json`.
- Jump to the QR poster with the active deployment URL.

Implementation:

- Draft/config transforms: `src/lib/forge/config.ts`
- Tests: `src/lib/forge/config.test.ts`
- Route: `src/routes/Forge.svelte`

The Forge is intentionally local. It does not save drafts, call a backend, or
submit data to ByteWorthy.
