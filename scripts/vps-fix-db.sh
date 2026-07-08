#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE_FILE="docker-compose.prod.yml"

[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }

echo "==> Migrate"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm migrate

echo "==> Schema check"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c \
  "SELECT column_name FROM information_schema.columns WHERE table_name='HelpListing' ORDER BY 1;"

echo "==> Listing counts"
docker exec venezuelateayuda-db-1 psql -U vta -d venezuelateayuda -c \
  'SELECT status, COUNT(*) FROM "HelpListing" GROUP BY status;'

echo "==> API test"
curl -sf http://venezuelateayuda-app-1:3000/api/listings | head -c 400
echo
echo "DB fix done."
