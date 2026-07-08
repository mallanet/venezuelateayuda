#!/usr/bin/env bash
# Registers venezuelateayuda.org in persistent /docker/caddy/Caddyfile.prod and rebuilds Caddy.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDY_DIR="${CADDY_DIR:-/docker/caddy}"
PROXY_NETWORK="${PROXY_NETWORK:-terremotoapp_mapa_prod_net}"
SITE_FILE="$ROOT/deploy/caddy/venezuelateayuda.caddy"
CADDYFILE="$CADDY_DIR/Caddyfile.prod"

sudo mkdir -p "$CADDY_DIR"

if [[ ! -f "$CADDYFILE" ]]; then
  echo "==> Seeding Caddyfile from running container or /opt/mallanet"
  if docker exec terremotoapp-caddy-1 test -f /etc/caddy/Caddyfile 2>/dev/null; then
    docker exec terremotoapp-caddy-1 cat /etc/caddy/Caddyfile | sudo tee "$CADDYFILE" >/dev/null
  elif [[ -f /opt/mallanet/Caddyfile.prod ]]; then
    sudo cp /opt/mallanet/Caddyfile.prod "$CADDYFILE"
  else
    echo "No base Caddyfile found"
    exit 1
  fi
fi

if ! sudo grep -q 'venezuelateayuda.org' "$CADDYFILE"; then
  echo "==> Appending venezuelateayuda site block"
  sudo tee -a "$CADDYFILE" < "$SITE_FILE" >/dev/null
fi

if [[ ! -f "$CADDY_DIR/Dockerfile" ]]; then
  sudo tee "$CADDY_DIR/Dockerfile" >/dev/null <<'EOF'
FROM caddy:2-alpine
COPY Caddyfile.prod /etc/caddy/Caddyfile
EOF
fi

echo "==> Rebuilding Caddy from persistent config"
bash "$ROOT/scripts/vps-rebuild-caddy.sh"

echo "Bootstrap done."
