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

api_ok() {
  curl -sf "http://venezuelateayuda-app-1:3000/api/health" 2>/dev/null | grep -q '"ok":true'
}

reset_db() {
  echo "==> Full DB reset (volume + migrate + seed)"
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v --remove-orphans || true
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
  for _ in $(seq 1 40); do
    docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
    sleep 1
  done
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" --profile seed run --rm seed
}

echo "==> Ensure DB running"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d db
for _ in $(seq 1 30); do
  docker exec venezuelateayuda-db-1 pg_isready -U vta -d venezuelateayuda >/dev/null 2>&1 && break
  sleep 1
done

docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda \
  -c "ALTER USER vta WITH PASSWORD \$\$${POSTGRES_PASSWORD}\$\$;" || true

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate app
sleep 4

if ! api_ok; then
  reset_db
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build --force-recreate app
  sleep 6
fi

if ! api_ok; then
  curl -s "http://venezuelateayuda-app-1:3000/api/health" || true
  exit 1
fi

curl -s "http://venezuelateayuda-app-1:3000/api/health"
echo
echo "DB fix done."
