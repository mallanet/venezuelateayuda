#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck source=scripts/lib/env-prod.sh
source "$ROOT/scripts/lib/env-prod.sh"

ENV_FILE="${ENV_FILE:-/opt/venezuelateayuda/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="$ROOT/.env.prod"
COMPOSE_FILE="docker-compose.prod.yml"
RUN_SEED="${RUN_SEED:-false}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE — copy .env.prod.example and fill secrets."
  exit 1
fi

POSTGRES_PASSWORD="$(env_prod_read "$ENV_FILE" POSTGRES_PASSWORD)"
[[ -n "$POSTGRES_PASSWORD" ]] || { echo "POSTGRES_PASSWORD empty"; exit 1; }

export ENV_FILE

echo "==> Ensure shared edge network"
docker network create vps_edge 2>/dev/null || true

echo "==> Ensure database is running"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Sync Postgres password with .env.prod"
escaped="$(printf '%s' "$POSTGRES_PASSWORD" | sed "s/'/''/g")"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD '${escaped}';"

echo "==> Running database migrations"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" rm -sf migrate 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "==> Building and starting VTA stack (isolated)"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
docker rm -f venezuelateayuda-caddy-1 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

echo "==> Edge SNI proxy (shared IP, separate Caddies)"
bash "$ROOT/scripts/vps-setup-edge.sh"

if [[ "$RUN_SEED" == "true" ]]; then
  echo "==> Seeding admin user"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile seed run --rm seed
fi

echo "==> Status"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps

echo "Deploy complete — https://venezuelateayuda.org"
