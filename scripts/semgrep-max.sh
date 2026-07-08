#!/usr/bin/env bash
# semgrep-max.sh — SAST for this repo only. Packs: security-baseline/semgrep.packs (SSOT).
set -euo pipefail
cd "$(dirname "$0")/.."
PACKS="/home/kleosr/Documentos/security-baseline/semgrep.packs"
export EIO_BACKEND="${EIO_BACKEND:-posix}"
SEMGREP_JOBS="${SEMGREP_JOBS:-1}"
CONFIGS=()
while IFS= read -r line; do
  [[ -z "$line" || "$line" == \#* ]] && continue
  CONFIGS+=("--config=$line")
done < "$PACKS"
exec semgrep --jobs "$SEMGREP_JOBS" --error --severity=ERROR "${CONFIGS[@]}" .
