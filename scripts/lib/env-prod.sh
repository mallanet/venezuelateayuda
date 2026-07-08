#!/usr/bin/env bash
# Safe read/write for .env.prod (passwords may contain shell metacharacters).

env_prod_quote() {
  printf '%s' "$1" | sed "s/'/'\\\\''/g"
}

env_prod_encode_password() {
  node -e 'console.log(encodeURIComponent(process.argv[1]))' "$1"
}

env_prod_database_url() {
  local password="$1"
  printf 'postgresql://vta:%s@db:5432/venezuelateayuda' "$(env_prod_encode_password "$password")"
}

env_prod_read() {
  local file="$1" key="$2"
  local line value
  line="$(grep -m1 "^${key}=" "$file" || true)"
  [[ -n "$line" ]] || return 1
  value="${line#*=}"
  if [[ "$value" == \'*\' ]]; then
    value="${value#\'}"
    value="${value%\'}"
  elif [[ "$value" == \"*\" ]]; then
    value="${value#\"}"
    value="${value%\"}"
  fi
  printf '%s' "$value"
}

env_prod_write() {
  local dest="$1"
  local db_url
  db_url="$(env_prod_database_url "${POSTGRES_PASSWORD}")"
  umask 077
  cat >"$dest" <<EOF
POSTGRES_PASSWORD='$(env_prod_quote "${POSTGRES_PASSWORD}")'
DATABASE_URL='$(env_prod_quote "${db_url}")'
AUTH_SECRET='$(env_prod_quote "${AUTH_SECRET}")'
AUTH_URL='$(env_prod_quote "${AUTH_URL}")'
NEXT_PUBLIC_APP_URL='$(env_prod_quote "${NEXT_PUBLIC_APP_URL}")'
EMAIL_FROM='$(env_prod_quote "${EMAIL_FROM}")'
ADMIN_EMAIL='$(env_prod_quote "${ADMIN_EMAIL}")'
ADMIN_PASSWORD='$(env_prod_quote "${ADMIN_PASSWORD}")'
EOF
  chmod 600 "$dest"
}
