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

echo "==> App health (in-container)"
docker exec venezuelateayuda-app-1 wget -qO- http://127.0.0.1:3000/api/health 2>&1 || true
echo

echo "==> App logs (tail)"
docker logs venezuelateayuda-app-1 --tail 30 2>&1 || true

echo "==> Public health"
curl -sS https://venezuelateayuda.org/api/health || true
echo
