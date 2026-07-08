#!/usr/bin/env bash
# Write canonical .env.prod (local + /opt/venezuelateayuda). Source: env vars or file.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_LOCAL="${OUT_LOCAL:-$ROOT/.env.prod}"
OUT_VPS="${OUT_VPS:-/opt/venezuelateayuda/.env.prod}"

: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD required}"
: "${AUTH_SECRET:?AUTH_SECRET required}"
: "${ADMIN_PASSWORD:?ADMIN_PASSWORD required}"

AUTH_URL="${AUTH_URL:-https://venezuelateayuda.org}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://venezuelateayuda.org}"
EMAIL_FROM="${EMAIL_FROM:-no-reply@venezuelateayuda.org}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@venezuelateayuda.org}"

write_file() {
  local dest="$1"
  umask 077
  cat >"$dest" <<EOF
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
AUTH_SECRET=${AUTH_SECRET}
AUTH_URL=${AUTH_URL}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
EMAIL_FROM=${EMAIL_FROM}
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF
  chmod 600 "$dest"
  echo "Wrote $dest"
}

write_file "$OUT_LOCAL"
if [[ -w "$(dirname "$OUT_VPS")" ]] || [[ "$EUID" -eq 0 ]]; then
  mkdir -p "$(dirname "$OUT_VPS")"
  write_file "$OUT_VPS"
fi
