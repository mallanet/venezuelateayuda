#!/usr/bin/env bash
# Shared edge proxy: one public IP, isolated Caddy per project (SNI passthrough).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EDGE_SRC="${EDGE_SRC:-$(cd "$(dirname "$0")/.." && pwd)/deploy/edge}"
EDGE_DIR="${EDGE_DIR:-/docker/edge}"
EDGE_NET="${EDGE_NET:-vps_edge}"

echo "==> Ensure edge network"
docker network create "$EDGE_NET" 2>/dev/null || true

echo "==> Install edge config to $EDGE_DIR"
sudo mkdir -p "$EDGE_DIR"
sudo cp "$EDGE_SRC/haproxy.cfg" "$EDGE_DIR/haproxy.cfg"
sudo cp "$EDGE_SRC/docker-compose.yml" "$EDGE_DIR/docker-compose.yml"

echo "==> Connect project Caddies to $EDGE_NET"
for c in terremotoapp-caddy-1 venezuelateayuda-caddy-1; do
  docker network connect "$EDGE_NET" "$c" 2>/dev/null || true
done

echo "==> Stop duplicate host bindings on :80/:443 (not edge)"
while read -r line; do
  id="${line%% *}"
  name="${line#* }"
  [[ "$name" == *edge-haproxy* || "$name" == *vps-edge* ]] && continue
  if docker port "$id" 80/tcp >/dev/null 2>&1 || docker port "$id" 443/tcp >/dev/null 2>&1; then
    echo "WARN: $name still publishes 80/443 — recreate via compose without host ports"
  fi
done < <(docker ps --format '{{.ID}} {{.Names}}')

echo "==> Start edge HAProxy"
docker compose -f "$EDGE_DIR/docker-compose.yml" up -d --force-recreate

sleep 3
docker ps --filter name=vps-edge --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "Edge proxy ready."
