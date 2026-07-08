#!/usr/bin/env bash
# Rebuild Terremoto Caddy image from /docker/caddy/Caddyfile.prod (survives container restarts).
set -euo pipefail

CADDY_DIR="${CADDY_DIR:-/docker/caddy}"
CADDY_CONTAINER="${CADDY_CONTAINER:-terremotoapp-caddy-1}"
IMAGE="${CADDY_IMAGE:-terremotoapp-caddy}"
NETWORK="${PROXY_NETWORK:-terremotoapp_mapa_prod_net}"

if [[ ! -f "$CADDY_DIR/Caddyfile.prod" ]]; then
  echo "Missing $CADDY_DIR/Caddyfile.prod"
  exit 1
fi

echo "==> Building $IMAGE from $CADDY_DIR"
docker build -t "$IMAGE:latest" "$CADDY_DIR"

echo "==> Recreating Caddy container"
docker rm -f "$CADDY_CONTAINER" 2>/dev/null || true

docker run -d \
  --name "$CADDY_CONTAINER" \
  --restart unless-stopped \
  --network "$NETWORK" \
  -p 80:80 -p 443:443 \
  -v terremotoapp_caddy_data:/data \
  -v terremotoapp_caddy_config:/config \
  --cap-drop ALL \
  --cap-add NET_BIND_SERVICE \
  --security-opt no-new-privileges:true \
  "$IMAGE:latest"

echo "==> Validating Caddy"
sleep 2
docker exec "$CADDY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile
echo "Caddy rebuilt."
