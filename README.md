# Venezuela Te Ayuda — Mapa de ayuda mutua

Plataforma web que conecta a personas que ofrecen ayuda con personas que la necesitan en Venezuela, centrada en un mapa interactivo con fichas de ayuda verificadas manualmente.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS 4** + **shadcn/ui**
- **Postgres** con **Prisma 6**
- **Auth.js (NextAuth v5)** con credenciales, verificación de email y roles (`AYUDANTE`, `SOLICITANTE`, `ADMIN`)
- **Leaflet + OpenStreetMap** (`react-leaflet`) para el mapa
- **Playwright** para tests end-to-end

## Funcionalidades

- Mapa a pantalla completa (`/mapa`) con marcadores por tipo y categoría, filtros y lista sincronizada (hoja inferior en móvil).
- Dos perfiles: quien ofrece ayuda y quien la necesita.
- Fichas de ayuda con moderación: todo usuario y toda ficha nacen `PENDIENTE` y un administrador los aprueba antes de publicarse.
- Chat interno 1 a 1 (sin exponer teléfono ni email) y sistema de denuncias.
- Panel de administración (`/admin`): aprobación de usuarios y fichas, denuncias, suspensiones y métricas, con registro de auditoría.
- Páginas legales (`/legal/terminos`, `/legal/privacidad`) y consentimiento explícito en el registro.

## Desarrollo local

Requisitos: Node 20+, Docker (para Postgres).

```bash
# 1. Base de datos
docker run -d --name vta-postgres \
  -e POSTGRES_USER=vta -e POSTGRES_PASSWORD=vta_dev -e POSTGRES_DB=venezuelateayuda \
  -p 5433:5432 postgres:16-alpine

# 2. Dependencias y esquema
npm install
npx prisma migrate dev

# 3. Usuario administrador inicial
npm run seed   # admin@venezuelateayuda.org / admin-vta-2026 (configurable con ADMIN_EMAIL / ADMIN_PASSWORD)

# 4. Servidor de desarrollo
npm run dev
```

Variables de entorno en `.env` (ver `.env.example`). En desarrollo, los emails de verificación se imprimen en la consola del servidor.

## Tests E2E

```bash
npx playwright install chromium
npx playwright test          # chromium + mobile-chrome
```

Los tests levantan el dev server en el puerto 3100 y cubren: registro con verificación de email, aprobación de usuario y ficha desde el panel admin, visibilidad de fichas aprobadas en el mapa, contacto por chat y reglas de minimización de datos.

## Despliegue en Vercel

1. Crea el proyecto en Vercel e importa este repositorio.
2. Provisiona **Neon Postgres** desde el Vercel Marketplace (crea `DATABASE_URL` automáticamente).
3. Configura las variables: `AUTH_SECRET` (genera con `openssl rand -hex 32`), `AUTH_URL` y `NEXT_PUBLIC_APP_URL` (URL pública del sitio).
4. Ejecuta las migraciones contra la base de producción: `npx prisma migrate deploy`, y el seed del admin: `npm run seed`.
5. Conecta un proveedor de email real (Resend, SES, etc.) en `src/lib/email.ts` para los correos de verificación.
