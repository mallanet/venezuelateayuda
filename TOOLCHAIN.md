# TOOLCHAIN — venezuelateayuda

Done = these green (evidence in the report). Do not invent extras.

```bash
npm run lint
npm run typecheck
npm run build
```

E2E (when the change touches auth, registration, map, or critical user flows):

```bash
npx playwright test
```

DB generate (after schema edits; does not replace migrations discipline):

```bash
npx prisma generate
```

Destructive DB (`db:clean`, migrate reset, seed to prod-like) only when the user
explicitly asked — not part of default Done.
