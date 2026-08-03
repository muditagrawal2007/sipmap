#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Verify sipmap is fully free. Fails if any paid service or telemetry SDK is detected.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🔍 Verifying sipmap is free of paid dependencies & telemetry…"

FAIL=0

# ---- 1. Forbidden packages (telemetry / paid services) ----
FORBIDDEN_PACKAGES=(
  "sentry"
  "@sentry"
  "datadog"
  "dd-trace"
  "logrocket"
  "mixpanel"
  "segment"
  "fullstory"
  "hotjar"
  "intercom-client"
  "amplitude"
  "bugsnag"
  "rollbar"
  "newrelic"
  "appoptics"
  "honeybadger"
)

if [ -f package.json ]; then
  for pkg in "${FORBIDDEN_PACKAGES[@]}"; do
    if grep -q "\"$pkg" package.json; then
      echo "❌ Forbidden paid/telemetry package found: $pkg"
      FAIL=1
    fi
  done
fi

# ---- 2. Forbidden URLs in source (pointing to known paid services) ----
FORBIDDEN_HOSTS=(
  "ingest.sentry.io"
  "browser.sentry-cdn.com"
  "www.datadoghq.com"
  "logging.newrelic.com"
  "cdn.logrocket.io"
  "cdn.mxpnl.com"
  "cdn.segment.com"
  "rs.fullstory.com"
  "static.hotjar.com"
  "widget.intercom.io"
)

if [ -d src ]; then
  for host in "${FORBIDDEN_HOSTS[@]}"; do
    if grep -r --include="*.js" --include="*.json" -l "$host" src/ app.yml 2>/dev/null | head -1 | grep -q .; then
      echo "❌ Forbidden paid service URL found in source: $host"
      FAIL=1
    fi
  done
fi

# ---- 3. app.yml must not declare a paid Marketplace listing ----
if [ -f app.yml ]; then
  if grep -qi "marketplace" app.yml; then
    echo "❌ app.yml contains 'marketplace' — paid listing reference"
    FAIL=1
  fi
fi

# ---- 4. No outbound network calls beyond GitHub API ----
# Look for fetch/axios/got calls and verify the URLs are GitHub only.
if [ -d src ]; then
  FETCH_HITS=$(grep -rEn --include="*.js" "(fetch|axios|got)\s*\(" src/ 2>/dev/null || true)
  if [ -n "$FETCH_HITS" ]; then
    echo "$FETCH_HITS" | while IFS= read -r line; do
      if ! echo "$line" | grep -qE "api\.github\.com|github\.com"; then
        echo "❌ Outbound call outside GitHub detected:"
        echo "   $line"
        FAIL=1
      fi
    done
  fi
fi

# ---- 5. License is MIT ----
if [ -f LICENSE ]; then
  if ! grep -q "MIT License" LICENSE; then
    echo "❌ LICENSE doesn't contain 'MIT License'"
    FAIL=1
  fi
fi

# ---- 6. package.json declares MIT ----
if command -v jq >/dev/null 2>&1; then
  LICENSE_TYPE=$(jq -r '.license // empty' package.json 2>/dev/null || true)
  if [ "$LICENSE_TYPE" != "MIT" ]; then
    echo "❌ package.json license is not MIT (got: '$LICENSE_TYPE')"
    FAIL=1
  fi
fi

if [ $FAIL -eq 0 ]; then
  echo "✅ sipmap is fully free. No paid services, no telemetry, no Marketplace."
  exit 0
else
  echo "💸 Cost-leak detected. Please remove the offending items before merging."
  exit 1
fi
