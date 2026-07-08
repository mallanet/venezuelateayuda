#!/usr/bin/env bash
# Fix Terremoto 502: start app containers + Caddy with mounted config.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDYFILE="${CADDYFILE:-/docker/caddy/Caddyfile.prod}"
MALLANET_CADDY="${MALLANET_CADDY:-/opt/mallanet/Caddyfile.prod}"

echo "==> Start Terremoto containers"
for c in terremotoapp-valkey-1 terremotoapp-db-1 terremotoapp-backend-1 \
  terremotoapp-worker-1 terremotoapp-frontend-1 terremotoapp-admin-1; do
  docker start "$c" 2>/dev/null || true
done

if [[ -f "$CADDYFILE" ]]; then
  python3 - "$CADDYFILE" <<'PY'
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
  cp "$CADDYFILE" "$MALLANET_CADDY" 2>/dev/null || true
fi

bash "$ROOT/scripts/vps-bootstrap.sh" 2>/dev/null || true
bash "$ROOT/scripts/vps-rebuild-caddy.sh"

echo "==> Status"
docker ps --filter "name=terremotoapp-" --format "table {{.Names}}\t{{.Status}}"

sleep 3
curl -sfI -H 'Host: terremotovenezuela.app' http://127.0.0.1/ | head -1 || echo "WARN: terremoto failing"
curl -sfI -H 'Host: venezuelateayuda.org' http://127.0.0.1/ | head -1 || echo "WARN: vta failing"
echo "Terremoto fix finished."
