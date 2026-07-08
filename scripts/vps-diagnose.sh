#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/env-prod.sh
source "$ROOT/scripts/lib/env-prod.sh"

ENV_FILE="${ENV_FILE:-/opt/venezuelateayuda/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="$ROOT/.env.prod"
[[ -f "$ENV_FILE" ]] || { echo "Missing .env.prod"; exit 1; }

POSTGRES_PASSWORD="$(env_prod_read "$ENV_FILE" POSTGRES_PASSWORD)"
DATABASE_URL="$(env_prod_read "$ENV_FILE" DATABASE_URL || true)"

echo "==> Env file: $ENV_FILE"
echo "==> POSTGRES_PASSWORD length: ${#POSTGRES_PASSWORD}"
echo "==> DATABASE_URL set: $([[ -n "$DATABASE_URL" ]] && echo yes || echo no)"

echo "==> DB container"
docker ps --filter name=venezuelateayuda-db-1 --format '{{.Names}} {{.Status}}' || true

echo "==> psql as vta (local socket)"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c 'SELECT 1 AS ok;' || true

echo "==> psql with password from env"
PGPASSWORD="$POSTGRES_PASSWORD" docker exec -e PGPASSWORD venezuelateayuda-db-1 \
  psql -h 127.0.0.1 -U vta -d venezuelateayuda -c 'SELECT 2 AS ok;' || true

echo "==> App DATABASE_URL (from container)"
docker exec venezuelateayuda-app-1 node -e "
const u = process.env.DATABASE_URL;
if (!u) { console.log('missing'); process.exit(0); }
const parsed = new URL(u);
console.log('user=' + parsed.username);
console.log('host=' + parsed.hostname);
console.log('passwordLen=' + (parsed.password?.length ?? 0));
" 2>&1 || true

echo "==> App env keys"
docker exec venezuelateayuda-app-1 node -e "
console.log('DATABASE_URL=' + Boolean(process.env.DATABASE_URL));
console.log('DATABASE_URL_UNPOOLED=' + Boolean(process.env.DATABASE_URL_UNPOOLED));
" 2>&1 || true

echo "==> Prisma client path (app)"
docker exec venezuelateayuda-app-1 node -e "console.log(require.resolve('@prisma/client'))" 2>&1 || true

echo "==> App POSTGRES_PASSWORD length (container env)"
docker exec venezuelateayuda-app-1 node -e "console.log('appPassLen=' + (process.env.POSTGRES_PASSWORD?.length ?? 0))" 2>&1 || true

echo "==> App containers"
docker ps -a --filter name=venezuelateayuda-app --format '{{.Names}} {{.Status}} {{.ID}}' || true

echo "==> TCP auth from internal network"
docker run --rm --network venezuelateayuda_internal -e PGPASSWORD="$POSTGRES_PASSWORD" postgres:16-alpine \
  psql -h db -U vta -d venezuelateayuda -c 'SELECT 3 AS internal_net_ok;' 2>&1 || true

echo "==> TCP auth sharing app network namespace"
docker run --rm --network "container:venezuelateayuda-app-1" -e PGPASSWORD="$POSTGRES_PASSWORD" postgres:16-alpine \
  psql -h db -U vta -d venezuelateayuda -c 'SELECT 4 AS app_net_ok;' 2>&1 || true

echo "==> URL hash (app vs migrate)"
docker exec venezuelateayuda-app-1 node -e "
const c=require('crypto');
const h=(v)=>c.createHash('sha256').update(v||'').digest('hex').slice(0,12);
console.log('appDbUrl='+h(process.env.DATABASE_URL));
console.log('appPgPass='+h(process.env.POSTGRES_PASSWORD));
" 2>&1 || true
docker compose -f "$ROOT/docker-compose.prod.yml" --env-file "$ENV_FILE" run --rm migrate node -e "
const c=require('crypto');
const h=(v)=>c.createHash('sha256').update(v||'').digest('hex').slice(0,12);
console.log('migrateDbUrl='+h(process.env.DATABASE_URL));
console.log('migratePgPass='+h(process.env.POSTGRES_PASSWORD));
" 2>&1 || true

echo "==> Prisma probe (app container, POSTGRES_PASSWORD url)"
docker exec venezuelateayuda-app-1 node -e "
const { PrismaClient } = require('@prisma/client');
const pass = process.env.POSTGRES_PASSWORD;
const url = 'postgresql://vta:' + encodeURIComponent(pass) + '@db:5432/venezuelateayuda';
const prisma = new PrismaClient({ datasources: { db: { url } } });
prisma.helpListing.count().then((n) => console.log('appCountFromPass=' + n)).catch((e) => { console.error('appPassPrismaError=' + e.message); process.exit(1); }).finally(() => prisma.\$disconnect());
" 2>&1 || true

echo "==> Prisma probe (app container)"
docker exec venezuelateayuda-app-1 node -e "
const { PrismaClient } = require('@prisma/client');
const url = process.env.DATABASE_URL;
const prisma = new PrismaClient({ datasources: { db: { url } } });
prisma.helpListing.count().then((n) => console.log('appCount=' + n)).catch((e) => { console.error('appPrismaError=' + e.message); process.exit(1); }).finally(() => prisma.\$disconnect());
" 2>&1 || true

echo "==> Prisma probe (migrate image)"
docker compose -f "$ROOT/docker-compose.prod.yml" --env-file "$ENV_FILE" run --rm migrate \
  node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.helpListing.count().then((n) => { console.log('count=' + n); }).catch((e) => { console.error(e.message); process.exit(1); }).finally(() => prisma.\$disconnect());
" 2>&1 || true

echo "==> App health (in-container)"
docker exec venezuelateayuda-app-1 wget -qO- http://127.0.0.1:3000/api/health 2>&1 || true
echo

echo "==> App logs (tail)"
docker logs venezuelateayuda-app-1 --tail 30 2>&1 || true

echo "==> Public health"
curl -sS https://venezuelateayuda.org/api/health || true
echo
