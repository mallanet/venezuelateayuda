#!/usr/bin/env bash
# security-scan.sh — full security stack for Venezuela Te Ayuda only.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BASELINE="/home/kleosr/Documentos/security-baseline"
FAIL=0

have() { command -v "$1" >/dev/null 2>&1; }

echo "══════════════════════════════════════════"
echo " security-scan — venezuelateayuda"
echo "══════════════════════════════════════════"

echo "── semgrep ──"
if bash "$ROOT/scripts/semgrep-max.sh"; then
  echo "[PASS] semgrep"
else
  echo "[FAIL] semgrep"
  FAIL=1
fi

echo "── gitleaks ──"
if have gitleaks; then
  if gitleaks detect --source "$ROOT" --redact --no-banner \
    --report-format json --report-path "$ROOT/gitleaks-report.json"; then
    echo "[PASS] gitleaks"
  else
    echo "[FAIL] gitleaks (see gitleaks-report.json)"
    FAIL=1
  fi
else
  echo "[skip] gitleaks not installed"
fi

echo "── osv-scanner ──"
if have osv-scanner; then
  if osv-scanner scan "$ROOT"; then
    echo "[PASS] osv-scanner"
  else
    echo "[FAIL] osv-scanner"
    FAIL=1
  fi
else
  echo "[skip] osv-scanner not installed"
fi

echo "── trivy ──"
if have trivy; then
  trivy fs --scanners vuln,secret,misconfig "$ROOT" --exit-code 1 --format table \
    || { echo "[FAIL] trivy"; FAIL=1; }
  [[ $FAIL -eq 0 ]] && echo "[PASS] trivy"
else
  echo "[skip] trivy not installed"
fi

echo "── npm audit ──"
if (cd "$ROOT" && npm audit --audit-level=moderate); then
  echo "[PASS] npm audit"
else
  echo "[FAIL] npm audit"
  FAIL=1
fi

echo "══════════════════════════════════════════"
if [[ $FAIL -eq 0 ]]; then
  echo " security-scan complete — all passed"
else
  echo " security-scan complete — failures above"
fi
echo "══════════════════════════════════════════"
exit $FAIL
