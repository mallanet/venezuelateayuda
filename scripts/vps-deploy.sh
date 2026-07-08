#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="docker-compose.prod.yml"
CADDY_CONTAINER="${CADDY_CONTAINER:-terremotoapp-caddy-1}"
EDGE_NETWORK="${EDGE_NETWORK:-terremotoapp_mapa_prod_net}"
RUN_SEED="${RUN_SEED:-false}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.prod.example and fill secrets."
  exit 1
fi

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a

echo "==> Ensuring edge network"
docker network create "$EDGE_NETWORK" 2>/dev/null || true
docker network connect "$EDGE_NETWORK" "$CADDY_CONTAINER" 2>/dev/null || true

echo "==> Ensure database is running"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Sync Postgres password with .env.prod"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c \
  "ALTER USER vta WITH PASSWORD '${POSTGRES_PASSWORD}';"

echo "==> Running database migrations"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "==> Building and starting stack"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans --force-recreate app

echo "==> Installing Caddy site + restoring Terremoto proxy"
bash "$ROOT/scripts/vps-bootstrap.sh"
bash "$ROOT/scripts/vps-fix-terremoto.sh"

if [[ "$RUN_SEED" == "true" ]]; then
  echo "==> Seeding admin user"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile seed run --rm seed
fi

echo "==> Status"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Deploy complete — https://venezuelateayuda.org"
