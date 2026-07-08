#!/usr/bin/env bash
# Align Postgres role password with .env.prod without wiping data.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/lib/env-prod.sh
source "$ROOT/scripts/lib/env-prod.sh"

ENV_FILE="${ENV_FILE:-/opt/venezuelateayuda/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="$ROOT/.env.prod"
[[ -f "$ENV_FILE" ]] || { echo "Missing .env.prod"; exit 1; }

POSTGRES_PASSWORD="$(env_prod_read "$ENV_FILE" POSTGRES_PASSWORD)"
[[ -n "$POSTGRES_PASSWORD" ]] || { echo "POSTGRES_PASSWORD empty"; exit 1; }

COMPOSE_FILE="docker-compose.prod.yml"
DB_CONTAINER="${DB_CONTAINER:-venezuelateayuda-db-1}"

echo "==> Ensure database is up"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 40); do
  docker exec "$DB_CONTAINER" pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Sync Postgres password"
escaped="$(printf '%s' "$POSTGRES_PASSWORD" | sed "s/'/''/g")"
docker exec "$DB_CONTAINER" psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD '${escaped}';"

export ENV_FILE

echo "==> Migrate + recreate app with fresh env"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

sleep 8
docker exec venezuelateayuda-app-1 wget -qO- "http://127.0.0.1:3000/api/health" || true
echo
echo "Password sync done."
