#!/usr/bin/env bash
# Sync Postgres password with .env.prod (fixes Prisma auth failed after secret rotation).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="docker-compose.prod.yml"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
source "$ENV_FILE"

echo "==> Align Postgres password for user vta"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c \
  "ALTER USER vta WITH PASSWORD '${POSTGRES_PASSWORD}';"

echo "==> Migrate"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "==> Recreate app with current env"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

echo "==> API test"
sleep 3
curl -sf http://venezuelateayuda-app-1:3000/api/listings | head -c 300
echo
echo "DB auth fix done."
