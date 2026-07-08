#!/usr/bin/env bash
# Nuclear but reliable: recreate Postgres volume from canonical .env.prod
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="/opt/venezuelateayuda/.env.prod"
[[ -f "$ENV_FILE" ]] || { echo "Missing env file"; exit 1; }

grep -q '^POSTGRES_PASSWORD=.' "$ENV_FILE" || { echo "POSTGRES_PASSWORD missing in env"; exit 1; }

COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Recreate DB volume and stack"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v --remove-orphans || true
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db

for _ in $(seq 1 40); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile seed run --rm seed
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build app

sleep 8
curl -sf "http://venezuelateayuda-app-1:3000/api/health"
echo
curl -sf "http://venezuelateayuda-app-1:3000/api/listings" | head -c 200
echo
echo "DB fix done."
