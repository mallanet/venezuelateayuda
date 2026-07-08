#!/usr/bin/env bash
# Run Caddy with mounted Caddyfile (shared Terremoto + VTA).
set -euo pipefail

CADDY_DIR="${CADDY_DIR:-/docker/caddy}"
CADDY_CONTAINER="${CADDY_CONTAINER:-terremotoapp-caddy-1}"
NETWORK="${PROXY_NETWORK:-terremotoapp_mapa_prod_net}"
CADDYFILE="${CADDY_DIR}/Caddyfile.prod"

if [[ ! -f "$CADDYFILE" ]]; then
  echo "Missing $CADDYFILE"
  exit 1
fi

echo "==> Recreating Caddy with mounted config"
docker rm -f "$CADDY_CONTAINER" 2>/dev/null || true

docker run -d \
  --name "$CADDY_CONTAINER" \
  --restart unless-stopped \
  --network "$NETWORK" \
  -p 80:80 -p 443:443 \
  -v "${CADDYFILE}:/etc/caddy/Caddyfile:ro" \
  -v terremotoapp_caddy_data:/data \
  -v terremotoapp_caddy_config:/config \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  caddy:2-alpine

sleep 2
docker exec "$CADDY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile
echo "Caddy up with mounted $CADDYFILE"
