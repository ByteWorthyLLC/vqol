# Structure

```text
.
├── src/
│   ├── App.svelte
│   ├── app.css
│   ├── main.ts
│   ├── lib/
│   │   ├── aggregate/
│   │   ├── calendar/
│   │   ├── chart/
│   │   ├── demo/
│   │   ├── device/
│   │   ├── download/
│   │   ├── forge/
│   │   ├── fork/
│   │   ├── i18n/
│   │   ├── marketing/
│   │   ├── notifications/
│   │   ├── offline/
│   │   ├── pdf/
│   │   ├── practice-config/
│   │   ├── scoring/
│   │   ├── storage/
│   │   ├── studio/
│   │   └── survey/
│   └── routes/
├── messages/
├── public/
├── scripts/
├── docs/
├── .github/
└── .planning/
```

## Source Layout Rules

- Route components stay in `src/routes/`.
- Reusable logic stays under `src/lib/<domain>/`.
- Tests sit next to the module they verify as `*.test.ts`.
- Locale strings stay in `messages/*.json`.
- Practice-owned runtime config stays in `public/practice.json`.
- Deployable share assets live in `public/assets/`; archival launch assets live in `docs/assets/`.
- GSD state stays in `.planning/`.

## Generated or Ignored

- `dist/` is build output and ignored.
- `node_modules/` is ignored.
- `.code-review-graph/graph.db` is generated knowledge-graph state.
