#!/usr/bin/env bash
# Push VPS .env.prod values to GitHub repo secrets (requires gh + token).
set -euo pipefail

ENV_FILE="${ENV_FILE:-/opt/venezuelateayuda/.env.prod}"
REPO="${REPO:-mallanet/venezuelateayuda}"

command -v gh >/dev/null || { echo "Install gh first"; exit 1; }

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

gh secret set VTA_POSTGRES_PASSWORD --repo "$REPO" --body "$POSTGRES_PASSWORD"
gh secret set VTA_AUTH_SECRET --repo "$REPO" --body "$AUTH_SECRET"
gh secret set VTA_ADMIN_PASSWORD --repo "$REPO" --body "$ADMIN_PASSWORD"
gh secret set VTA_ADMIN_EMAIL --repo "$REPO" --body "${ADMIN_EMAIL:-admin@mallanet.org}"
gh secret set VTA_EMAIL_FROM --repo "$REPO" --body "${EMAIL_FROM:-no-reply@mallanet.org}"

if [[ -n "${RESEND_API_KEY:-}" ]]; then
  gh secret set VTA_RESEND_API_KEY --repo "$REPO" --body "$RESEND_API_KEY"
fi
if [[ -n "${SMTP_HOST:-}" ]]; then
  gh secret set VTA_SMTP_HOST --repo "$REPO" --body "$SMTP_HOST"
  gh secret set VTA_SMTP_PORT --repo "$REPO" --body "${SMTP_PORT:-465}"
  gh secret set VTA_SMTP_USERNAME --repo "$REPO" --body "${SMTP_USERNAME:-}"
  gh secret set VTA_SMTP_PASSWORD --repo "$REPO" --body "${SMTP_PASSWORD:-}"
  gh secret set VTA_SMTP_FROM --repo "$REPO" --body "${SMTP_FROM:-}"
fi

echo "GitHub secrets synced for $REPO"
