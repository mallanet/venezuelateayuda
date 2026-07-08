#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-$ROOT/.env.prod}"
[[ -f "$ENV_FILE" ]] || ENV_FILE="/opt/venezuelateayuda/.env.prod"
[[ -f "$ENV_FILE" ]] || { echo "No env file"; exit 1; }

# shellcheck disable=SC1090
set -a && source "$ENV_FILE" && set +a
POSTGRES_PASSWORD="${POSTGRES_PASSWORD//$'\r'/}"

COMPOSE_FILE="docker-compose.prod.yml"

tcp_auth_ok() {
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" venezuelateayuda-db-1 \
    psql -h 127.0.0.1 -U vta -d venezuelateayuda -c 'SELECT 1' >/dev/null 2>&1
}

api_ok() {
  curl -sf "http://venezuelateayuda-app-1:3000/api/health" | grep -q '"ok":true'
}

echo "==> Start DB"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

echo "==> Align password"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD \$\$${POSTGRES_PASSWORD}\$\$;"

if ! tcp_auth_ok; then
  echo "==> TCP auth still failing — reset Postgres volume"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans || true
  docker volume rm venezuelateayuda_pgdata 2>/dev/null || true
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
  for _ in $(seq 1 30); do
    docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
    sleep 1
  done
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile seed run --rm seed
fi

echo "==> Migrate + app"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app

sleep 5
if ! api_ok; then
  echo "API health check failed"
  curl -s "http://venezuelateayuda-app-1:3000/api/health" || true
  exit 1
fi

curl -s "http://venezuelateayuda-app-1:3000/api/health"
echo
echo "DB auth fix done."
