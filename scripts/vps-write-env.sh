#!/usr/bin/env bash
# Write canonical .env.prod (local + /opt/venezuelateayuda). Source: env vars or file.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# shellcheck source=scripts/lib/env-prod.sh
source "$ROOT/scripts/lib/env-prod.sh"

OUT_LOCAL="${OUT_LOCAL:-$ROOT/.env.prod}"
OUT_VPS="${OUT_VPS:-/opt/venezuelateayuda/.env.prod}"

: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD required}"
: "${AUTH_SECRET:?AUTH_SECRET required}"
: "${ADMIN_PASSWORD:?ADMIN_PASSWORD required}"

AUTH_URL="${AUTH_URL:-https://venezuelateayuda.org}"
NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://venezuelateayuda.org}"
EMAIL_FROM="${EMAIL_FROM:-no-reply@venezuelateayuda.org}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@venezuelateayuda.org}"

write_dest() {
  local dest="$1"
  env_prod_write "$dest"
  echo "Wrote $dest"
}

write_dest "$OUT_LOCAL"
if [[ -w "$(dirname "$OUT_VPS")" ]] || [[ "$EUID" -eq 0 ]]; then
  mkdir -p "$(dirname "$OUT_VPS")"
  write_dest "$OUT_VPS"
fi
