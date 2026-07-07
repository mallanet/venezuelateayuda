#!/usr/bin/env bash
set -euo pipefail

# Run Semgrep with the maximum open-registry security stack.
# Every finding at ERROR severity fails the build. Supply-chain (SCA)
# and Next.js/React-specific rules are included for this stack.
cd "$(dirname "$0")/.."

exec semgrep \
  --error \
  --severity=ERROR \
  --config=p/security-audit \
  --config=p/owasp-top-ten \
  --config=p/secrets \
  --config=p/trailofbits \
  --config=p/typescript \
  --config=p/javascript \
  --config=p/python \
  --config=p/supply-chain \
  --config=p/nextjs \
  --config=p/react \
  .
