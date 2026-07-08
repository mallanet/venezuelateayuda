#!/usr/bin/env bash
# Fix shared Caddy: Terremoto + venezuelateayuda TLS/proxy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDY_DIR="${CADDY_DIR:-/docker/caddy}"
CADDYFILE="${CADDY_DIR}/Caddyfile.prod"
MALLANET_CADDY="${MALLANET_CADDY:-/opt/mallanet/Caddyfile.prod}"
SITE_FILE="$ROOT/deploy/caddy/venezuelateayuda.caddy"
NETWORK="${PROXY_NETWORK:-terremotoapp_mapa_prod_net}"

echo "==> Start Terremoto containers"
for c in terremotoapp-valkey-1 terremotoapp-db-1 terremotoapp-backend-1 \
  terremotoapp-worker-1 terremotoapp-frontend-1 terremotoapp-admin-1; do
  docker start "$c" 2>/dev/null || true
done

echo "==> Start VTA app"
docker start venezuelateayuda-app-1 venezuelateayuda-db-1 2>/dev/null || true
docker network connect "$NETWORK" venezuelateayuda-app-1 2>/dev/null || true

sudo mkdir -p "$CADDY_DIR"

echo "==> Rebuild shared Caddyfile"
if [[ -f "$MALLANET_CADDY" ]]; then
  sudo cp "$MALLANET_CADDY" "$CADDYFILE"
elif docker exec terremotoapp-caddy-1 test -f /etc/caddy/Caddyfile 2>/dev/null; then
  docker exec terremotoapp-caddy-1 cat /etc/caddy/Caddyfile | sudo tee "$CADDYFILE" >/dev/null
fi

if [[ ! -f "$CADDYFILE" ]]; then
  echo "No base Caddyfile"
  exit 1
fi

# Drop stale VTA block before re-append
sudo sed -i '/venezuelateayuda.org/,/^}/d' "$CADDYFILE" 2>/dev/null || true
sudo tee -a "$CADDYFILE" < "$SITE_FILE" >/dev/null

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

sudo cp "$CADDYFILE" "$MALLANET_CADDY" 2>/dev/null || true

bash "$ROOT/scripts/vps-rebuild-caddy.sh"

echo "==> Status"
docker ps --filter "name=terremotoapp-caddy" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
docker ps --filter "name=venezuelateayuda-app" --format "table {{.Names}}\t{{.Status}}"

sleep 5
curl -sfI -H 'Host: terremotovenezuela.app' https://127.0.0.1/ -k | head -1 || echo "WARN: terremoto https failing"
curl -sfI -H 'Host: venezuelateayuda.org' https://127.0.0.1/ -k | head -1 || echo "WARN: vta https failing"
echo "Caddy fix finished."
