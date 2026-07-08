#!/usr/bin/env bash
# Ensure venezuelateayuda.org is in the shared Caddyfile (no docker run rebuild).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDY_DIR="${CADDY_DIR:-/docker/caddy}"
SITE_FILE="$ROOT/deploy/caddy/venezuelateayuda.caddy"
CADDYFILE="$CADDY_DIR/Caddyfile.prod"
MALLANET_CADDY="${MALLANET_CADDY:-/opt/mallanet/Caddyfile.prod}"

sudo mkdir -p "$CADDY_DIR"

if [[ ! -f "$CADDYFILE" ]]; then
  if docker exec terremotoapp-caddy-1 test -f /etc/caddy/Caddyfile 2>/dev/null; then
    docker exec terremotoapp-caddy-1 cat /etc/caddy/Caddyfile | sudo tee "$CADDYFILE" >/dev/null
  elif [[ -f "$MALLANET_CADDY" ]]; then
    sudo cp "$MALLANET_CADDY" "$CADDYFILE"
  else
    echo "No base Caddyfile found"
    exit 1
  fi
fi

if ! sudo grep -q 'venezuelateayuda.org' "$CADDYFILE"; then
  echo "==> Appending venezuelateayuda site block"
  sudo tee -a "$CADDYFILE" < "$SITE_FILE" >/dev/null
fi

sudo cp "$CADDYFILE" "$MALLANET_CADDY" 2>/dev/null || true
echo "Caddyfile updated."
