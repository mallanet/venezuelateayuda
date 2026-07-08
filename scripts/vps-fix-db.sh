#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="docker-compose.prod.yml"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
source "$ENV_FILE"

echo "==> Ensure DB up"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Reset Postgres password (local socket, dollar-quoted)"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD \$\$${POSTGRES_PASSWORD}\$\$;"

echo "==> Migrate"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "==> Recreate app"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

sleep 4
echo "==> Health"
curl -sf http://venezuelateayuda-app-1:3000/api/health || true
echo
curl -sf http://venezuelateayuda-app-1:3000/api/listings | head -c 200 || true
echo
echo "DB auth fix done."
