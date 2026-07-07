#!/usr/bin/env bash
# Registers venezuelateayuda.org in Terremoto's Caddy (shared 80/443).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CADDY_CONTAINER="${CADDY_CONTAINER:-terremotoapp-caddy-1}"
PROXY_NETWORK="${PROXY_NETWORK:-terremotoapp_mapa_prod_net}"
SITE_FILE="$ROOT/deploy/caddy/venezuelateayuda.caddy"

echo "==> Connecting Caddy to $PROXY_NETWORK"
docker network connect "$PROXY_NETWORK" "$CADDY_CONTAINER" 2>/dev/null || true

if docker exec "$CADDY_CONTAINER" grep -q 'venezuelateayuda.org' /etc/caddy/Caddyfile 2>/dev/null; then
  echo "Caddy site already configured"
else
  echo "==> Appending site block to Caddyfile"
  docker cp "$SITE_FILE" "${CADDY_CONTAINER}:/tmp/venezuelateayuda.caddy"
  docker exec "$CADDY_CONTAINER" sh -c 'cat /tmp/venezuelateayuda.caddy >> /etc/caddy/Caddyfile'
fi

echo "==> Reloading Caddy"
docker exec "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile

echo "Bootstrap done."
