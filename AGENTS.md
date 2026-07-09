# AGENTS.md — map only

## LAW vs MAP

- **Law:** `.cursor/rules/*.mdc` (synced from Documentos/rules). Do not restate SAFETY/QUALITY here.
- **This file:** map of *this* repo only (framework notes, motion system, hard stops).

Before non-readonly work under a nested tree that has its own `AGENTS.md`, read that file.

## Overview

Venezuela Te Ayuda — mutual-aid map platform. Next.js App Router + TypeScript,
Postgres/Prisma, Auth.js (NextAuth v5), Leaflet, roles, moderation, chat,
admin. Playwright e2e present.

## Where to look

| Task | Location | Notes |
|------|----------|-------|
| App routes / UI | `src/` | App Router |
| Auth | `src/lib/auth.ts`, NextAuth types | roles / JWT |
| Prisma schema | `prisma/schema.prisma` | |
| E2E | `e2e/` | Playwright |
| Motion tokens | `globals.css` + section below | no framer-motion |
| K8s / deploy | `infra/`, `DEPLOY.md`, `deploy/` | secrets not in git |
| Debt | `DEBT.md` | |

## Done / verify

See `TOOLCHAIN.md`.

## Hard stops (Never)

- Never log, commit, or paste user emails, phones, or chat bodies into reports.
- Do not weaken email verification, role checks, or ADMIN gates.
- Users and help cards start moderated (`PENDIENTE`); do not auto-approve in
  production code paths or prod seeds.
- Never commit secrets or real `.env` / k8s secret payloads.

## Ask first

- Prisma migrations, `db:clean`, seed against non-local data
- Deploy / k8s apply / production env changes
- Changes to consent, legal pages, or moderation state machine

## Deep links

- `README.md`
- `DEBT.md`
- `DEPLOY.md`

## Manual notes

<!-- Human-owned landmines. agents-map preserves this section on refresh. -->

---

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:motion-system -->
# Motion system — Venezuela Te Ayuda

Single source of truth: `globals.css` CSS custom properties + CSS classes. No framer-motion.

## Tokens (—motion-*) defined in :root
- `--motion-ease-out`: cubic-bezier(0.22, 1, 0.36, 1) — entrada suave
- `--motion-ease-in-out`: cubic-bezier(0.45, 0, 0.55, 1) — transiciones simétricas
- `--motion-duration-fast`: 160ms — template enter, micro-feedback
- `--motion-duration-base`: 280ms — hover, active, detalles UI
- `--motion-duration-slow`: 520ms — modales, sheets, cambios de estado
- `--motion-duration-reveal`: 720ms — scroll-reveal (hero, secciones)
- `--motion-stagger-step`: 80ms — escalonamiento de .delay-*

## Clases CSS reutilizables
| Clase | Uso |
|-------|-----|
| `.reveal` | Scroll reveal con subida (opacity+translateY). Añadir `.delay-1`...`.delay-6`. |
| `.reveal-in` | Scroll reveal solo opacidad. |
| `.template-enter` | Fade-in de navegación entre rutas (template.tsx). |
| `.hover-lift` | Card hover: sube 4px y sombra elevada. |
| `.vta-skeleton` | Esqueleto con shimmer azul. |
| `.heartbeat` | Logo heartbeat en loading. |
| `.template-enter` | Fade-in de página (template.tsx). |

## Componentes
- `Reveal` (`src/components/reveal.tsx`): IntersectionObserver + transition. Usos: `as`, `delay`, `className`. Server pages usan `.reveal` CSS class directa.
- `template.tsx`: Server component con fade-in automático (160ms) — navbar y footer estables.

## Reglas
- `prefers-reduced-motion`: override global en `@layer base` → todo instantáneo.
- Leaflet: solo opacity en page transition (160ms, sin transform); no animar contenedor del mapa.
- Hover: usar `hover-lift` para consistencia, no clases ad-hoc.
- Transiciones CSS: animar solo `opacity` y `transform`, nunca `width`/`height`/`top`/`left`.
<!-- END:motion-system -->
