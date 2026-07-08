#!/usr/bin/env bash
# One-shot: align Postgres password with /opt/venezuelateayuda/.env.prod and recreate app.
set -euo pipefail

ENV_FILE="/opt/venezuelateayuda/.env.prod"
COMPOSE_DIR="/tmp/runner/work/venezuelateayuda/venezuelateayuda"
[[ -d "$COMPOSE_DIR" ]] || COMPOSE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }
# shellcheck disable=SC1090
source "$ENV_FILE"

cd "$COMPOSE_DIR"

docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD \$\$${POSTGRES_PASSWORD}\$\$;"

docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" run --rm migrate
docker compose -f docker-compose.prod.yml --env-file "$ENV_FILE" up -d --force-recreate app

sleep 4
curl -sf http://venezuelateayuda-app-1:3000/api/health
echo
