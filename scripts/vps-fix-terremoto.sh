#!/usr/bin/env bash
# Fix Terremoto 502: Caddy (docker run) can't resolve compose service aliases.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDYFILE="${CADDYFILE:-/docker/caddy/Caddyfile.prod}"
COMPOSE_DIR="${TERREMOTO_COMPOSE_DIR:-/opt/mallanet}"
COMPOSE_FILE="${COMPOSE_DIR}/docker-compose.prod.yml"
ENV_FILE="${TERREMOTO_ENV_FILE:-${COMPOSE_DIR}/.prod.env}"

echo "==> Checking Terremoto containers"
needs_restart=false
for svc in frontend backend admin valkey; do
  if ! docker ps --format '{{.Names}}' | grep -q "^terremotoapp-${svc}-1$"; then
    echo "Missing terremotoapp-${svc}-1"
    needs_restart=true
  fi
done

if [[ "$needs_restart" == "true" && -f "$COMPOSE_FILE" ]]; then
  echo "==> Restarting Terremoto app services (not caddy)"
  env_args=()
  [[ -f "$ENV_FILE" ]] && env_args=(--env-file "$ENV_FILE")
  docker compose -f "$COMPOSE_FILE" "${env_args[@]}" -p terremotoapp up -d \
    valkey migrate backend worker frontend admin 2>/dev/null || true
fi

if [[ ! -f "$CADDYFILE" ]]; then
  echo "Missing $CADDYFILE"
  exit 1
fi

echo "==> Patching Caddy upstreams to container names"
python3 - "$CADDYFILE" <<'PY'
import pathlib, re, sys
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

echo "==> Health check"
sleep 3
curl -sfI -H 'Host: terremotovenezuela.app' http://127.0.0.1/ | head -1
curl -sfI -H 'Host: api.terremotovenezuela.app' http://127.0.0.1/ | head -1
echo "Terremoto fix applied."
