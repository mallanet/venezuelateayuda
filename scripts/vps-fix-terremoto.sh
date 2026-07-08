#!/usr/bin/env bash
# Fix Terremoto 502: restore compose-managed Caddy and restart app stack.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDYFILE="${CADDYFILE:-/docker/caddy/Caddyfile.prod}"
COMPOSE_DIR="${TERREMOTO_COMPOSE_DIR:-/opt/mallanet}"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.prod.yml"

for candidate in \
  "${COMPOSE_DIR}/.prod.env" \
  "/tmp/runner/work/Terremotoapp/Terremotoapp/.prod.env"; do
  [[ -f "$candidate" ]] && ENV_FILE="$candidate" && break
done
ENV_FILE="${ENV_FILE:-}"

echo "==> Start stopped Terremoto containers"
mapfile -t stopped < <(docker ps -a --filter "name=terremotoapp-" --filter "status=exited" --format '{{.Names}}' || true)
for c in "${stopped[@]}"; do
  [[ -z "$c" || "$c" == *"migrate"* ]] && continue
  docker start "$c" || true
done

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Missing $COMPOSE_FILE"
  exit 1
fi

if [[ -f "$CADDYFILE" ]]; then
  echo "==> Sync Caddyfile to Terremoto compose"
  cp "$CADDYFILE" "${COMPOSE_DIR}/Caddyfile.prod"
  # Compose aliases work when Caddy is managed by compose; keep container names as fallback.
  python3 - "${COMPOSE_DIR}/Caddyfile.prod" <<'PY'
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text()
for old, new in {
    "reverse_proxy frontend:": "reverse_proxy terremotoapp-frontend-1:",
    "reverse_proxy backend:": "reverse_proxy terremotoapp-backend-1:",
    "reverse_proxy admin:": "reverse_proxy terremotoapp-admin-1:",
}.items():
    text = text.replace(old, new)
path.write_text(text)
PY
  cp "${COMPOSE_DIR}/Caddyfile.prod" "$CADDYFILE"
fi

echo "==> Recreate Terremoto stack (compose-managed Caddy)"
env_args=()
[[ -n "$ENV_FILE" && -f "$ENV_FILE" ]] && env_args=(--env-file "$ENV_FILE")

docker rm -f terremotoapp-caddy-1 2>/dev/null || true
docker compose -f "$COMPOSE_FILE" "${env_args[@]}" -p terremotoapp up -d \
  valkey db backend worker frontend admin caddy

echo "==> Status"
docker ps --filter "name=terremotoapp-" --format "table {{.Names}}\t{{.Status}}"

sleep 4
echo "==> Health"
curl -sfI -H 'Host: terremotovenezuela.app' http://127.0.0.1/ | head -1 || echo "WARN: terremoto failing"
curl -sfI -H 'Host: api.terremotovenezuela.app' http://127.0.0.1/ | head -1 || echo "WARN: api failing"
curl -sfI -H 'Host: venezuelateayuda.org' http://127.0.0.1/ | head -1 || echo "WARN: vta failing"
echo "Terremoto fix finished."
