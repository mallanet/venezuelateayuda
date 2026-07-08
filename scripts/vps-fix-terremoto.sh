#!/usr/bin/env bash
# Fix Terremoto 502: Caddy (docker run) can't resolve compose service aliases.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDYFILE="${CADDYFILE:-/docker/caddy/Caddyfile.prod}"
COMPOSE_DIR="${TERREMOTO_COMPOSE_DIR:-/opt/mallanet}"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.prod.yml"
ENV_FILE="${TERREMOTO_ENV_FILE:-${COMPOSE_DIR}/.prod.env}"

echo "==> Starting stopped Terremoto containers"
mapfile -t stopped < <(docker ps -a --filter "name=terremotoapp-" --filter "status=exited" --format '{{.Names}}' || true)
for c in "${stopped[@]}"; do
  [[ -z "$c" || "$c" == *"migrate"* || "$c" == *"caddy"* ]] && continue
  echo "Starting $c"
  docker start "$c" || true
done

echo "==> Terremoto container status"
docker ps -a --filter "name=terremotoapp-" --format "table {{.Names}}\t{{.Status}}"

if [[ -f "$COMPOSE_FILE" ]]; then
  echo "==> Ensuring app services via compose"
  env_args=()
  [[ -f "$ENV_FILE" ]] && env_args=(--env-file "$ENV_FILE")
  docker compose -f "$COMPOSE_FILE" "${env_args[@]}" -p terremotoapp up -d \
    valkey db backend worker frontend admin 2>/dev/null || true
fi

if [[ ! -f "$CADDYFILE" ]]; then
  echo "Missing $CADDYFILE"
  exit 1
fi

echo "==> Patching Caddy upstreams to container names"
python3 - "$CADDYFILE" <<'PY'
import pathlib, sys
path = pathlib.Path(sys.argv[1])
text = path.read_text()
repl = {
    "reverse_proxy frontend:": "reverse_proxy terremotoapp-frontend-1:",
    "reverse_proxy backend:": "reverse_proxy terremotoapp-backend-1:",
    "reverse_proxy admin:": "reverse_proxy terremotoapp-admin-1:",
}
for old, new in repl.items():
    text = text.replace(old, new)
path.write_text(text)
PY

echo "==> Rebuilding Caddy"
bash "$ROOT/scripts/vps-rebuild-caddy.sh"

echo "==> Upstream probe from Caddy"
sleep 3
docker exec terremotoapp-caddy-1 wget -q -S -O /dev/null http://terremotoapp-frontend-1:3000 2>&1 | head -3 || echo "WARN: frontend unreachable from caddy"
docker exec terremotoapp-caddy-1 wget -q -S -O /dev/null http://terremotoapp-backend-1:8080 2>&1 | head -3 || echo "WARN: backend unreachable from caddy"

echo "==> Health check"
curl -sfI -H 'Host: terremotovenezuela.app' http://127.0.0.1/ | head -1 || echo "WARN: terremoto still failing"
curl -sfI -H 'Host: api.terremotovenezuela.app' http://127.0.0.1/ | head -1 || echo "WARN: api still failing"
echo "Terremoto fix finished."
