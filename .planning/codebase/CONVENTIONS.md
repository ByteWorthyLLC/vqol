# Conventions

## TypeScript

- Keep domain modules typed and small.
- Keep scoring pure and free of I/O.
- Keep storage access inside `src/lib/storage/`.
- Prefer explicit validation errors over generic thrown stack traces for operator-facing config.

## Svelte

- Route components receive callbacks from `App.svelte`.
- Use native controls where possible for accessibility.
- Keep text in message files rather than hardcoding route copy.

## Styling

- Global layout and print rules live in `src/app.css`.
- Practice colors are CSS custom properties applied at boot.
- Tap targets should remain at least 44px.
- Avoid clinical severity color semantics.

## Documentation

- Public operator docs live at root or `docs/`.
- GSD planning docs live in `.planning/`.
- Instrument licensing status must be updated in `INSTRUMENT-LICENSE.md`, not scattered through issues.
- Device and assistive-technology verification should be routed through `#/device` and `docs/DEVICE-VERIFICATION.md`.
