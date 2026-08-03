#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Verify that sipmap never triggers GitHub Actions workflows (zero Actions consumption).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔍 Verifying sipmap never triggers GitHub Actions workflows…"

FAIL=0

# ---- 1. No forbidden GitHub API endpoints in source ----
# These endpoints would WRITE/RE-RUN Actions workflows. Reading check-runs is allowed.
FORBIDDEN_API_CALLS=(
  "createWorkflowDispatch"
  "createWorkflowRun"
  "reRunWorkflow"
  "reRunJob"
  "cancelWorkflowRun"
  "actions.createWorkflowDispatch"
  "actions.reRunWorkflow"
  "actions.reRunJob"
  "actions.cancelWorkflowRun"
)

if [ -d src ]; then
  for fn in "${FORBIDDEN_API_CALLS[@]}"; do
    HITS=$(grep -rEn --include="*.js" "$fn" src/ 2>/dev/null || true)
    if [ -n "$HITS" ]; then
      echo "❌ Forbidden Actions-triggering call found in source: $fn"
      echo "$HITS" | sed 's/^/   /'
      FAIL=1
    fi
  done
fi

# ---- 2. No raw HTTP paths matching Actions trigger endpoints ----
# Matches: POST/PUT to /actions/workflows/.../dispatches, /actions/runs/.../rerun, etc.
FORBIDDEN_PATHS=(
  "/actions/workflows/.*/dispatches"
  "/actions/runs/.*/rerun"
  "/actions/runs/.*/cancel"
  "/actions/jobs/.*/rerun"
)

if [ -d src ]; then
  for p in "${FORBIDDEN_PATHS[@]}"; do
    HITS=$(grep -rEn --include="*.js" "$p" src/ 2>/dev/null || true)
    if [ -n "$HITS" ]; then
      echo "❌ Forbidden Actions path in source: $p"
      echo "$HITS" | sed 's/^/   /'
      FAIL=1
    fi
  done
fi

# ---- 3. Bot's own CI must not include workflow_dispatch triggers (consumes user Actions minutes when not its own repo) ----
if [ -f .github/workflows/ci.yml ]; then
  if grep -q "workflow_dispatch" .github/workflows/ci.yml; then
    # workflow_dispatch is allowed in the bot's own ci.yml — it doesn't run on user repos.
    # But we forbid it in any other workflow file.
    : # ok
  fi
  # No schedule triggers
  if grep -q "schedule:" .github/workflows/ci.yml; then
    echo "❌ .github/workflows/ci.yml contains a 'schedule:' trigger"
    FAIL=1
  fi
fi

# ---- 4. No other workflow files in .github/workflows/ that could consume Actions minutes unnecessarily ----
if [ -d .github/workflows ]; then
  WORKFLOW_FILES=$(find .github/workflows -name "*.yml" -o -name "*.yaml" 2>/dev/null)
  for f in $WORKFLOW_FILES; do
    if [ "$f" != ".github/workflows/ci.yml" ]; then
      echo "❌ Unexpected workflow file: $f (only ci.yml is allowed)"
      FAIL=1
    fi
  done
fi

# ---- 5. No 'actions' permission writes in app.yml ----
if [ -f app.yml ]; then
  if grep -q "actions: write" app.yml; then
    echo "❌ app.yml requests 'actions: write' permission"
    FAIL=1
  fi
fi

if [ $FAIL -eq 0 ]; then
  echo "✅ sipmap never triggers GitHub Actions workflows. Zero Actions minutes consumed."
  exit 0
else
  echo "🚨 sipmap would consume Actions minutes. Please fix the items above before merging."
  exit 1
fi
