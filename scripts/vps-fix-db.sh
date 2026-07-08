#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="/opt/venezuelateayuda/.env.prod"
[[ -f "$ENV_FILE" ]] || { echo "No env file"; exit 1; }

# shellcheck disable=SC1090
source "$ENV_FILE"

echo "Using env: $ENV_FILE"
COMPOSE_FILE="docker-compose.prod.yml"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "Reset Postgres password for vta"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD \$\$${POSTGRES_PASSWORD}\$\$;"

echo "Recreate app container"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

sleep 4
curl -sf "http://venezuelateayuda-app-1:3000/api/health" || echo "health check pending"
echo
echo "DB auth fix done."
