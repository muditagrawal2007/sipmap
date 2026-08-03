#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Non-interactive Fly.io deploy. Set env vars and run.
#
# Required env vars:
#   APP_ID                    numeric GitHub App ID
#   WEBHOOK_SECRET            matching secret (must match what's in your GitHub App)
#   PEM_PATH                  path to the .pem private key file
#
# Optional env vars (defaults shown):
#   APP_NAME=sipmap           Fly.io app name (becomes https://$APP_NAME.fly.dev/)
#   REGION=sin                Fly.io region (sin, iad, fra, syd, lax, etc.)
#   SKIP_DEPLOY=false         if true, only creates the app + sets secrets, no deploy
#   DESTROY=false             if true, destroys the app first (for clean re-deploys)
#
# Usage:
#   APP_ID=123456 \
#   WEBHOOK_SECRET=sipmap-shared-secret \
#   PEM_PATH=./app-private-key.pem \
#   scripts/deploy-fly-auto.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Colors
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD='\033[1m'; GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; RESET='\033[0m'
else
  BOLD=''; GREEN=''; YELLOW=''; RED=''; RESET=''
fi

say()  { printf "%b\n" "$*"; }
ok()   { say "${GREEN}✅ $*${RESET}"; }
warn() { say "${YELLOW}⚠ $*${RESET}"; }
die()  { say "${RED}❌ $*${RESET}"; exit 1; }

# ----- Validate inputs -----
[ -n "${APP_ID:-}" ] || die "APP_ID env var required (your GitHub App's numeric ID)"
[ -n "${WEBHOOK_SECRET:-}" ] || die "WEBHOOK_SECRET env var required (must match GitHub App)"
[ -n "${PEM_PATH:-}" ] || die "PEM_PATH env var required (path to your .pem file)"
[ -f "$PEM_PATH" ] || die "PEM file not found at: $PEM_PATH"

APP_NAME="${APP_NAME:-sipmap}"
REGION="${REGION:-sin}"
WEBHOOK_URL="https://${APP_NAME}.fly.dev/"

# ----- Check flyctl -----
command -v fly >/dev/null 2>&1 || die "flyctl not installed. Install: brew install flyctl"

# ----- Check auth -----
if ! fly auth whoami >/dev/null 2>&1; then
  die "Not logged in to Fly.io. Run: fly auth signup (or fly auth login)"
fi
FLY_USER=$(fly auth whoami | head -1 | awk -F '@' '{print $1}' | tr -d ' ')

say ""
say "${BOLD}🚀 sipmap → Fly.io deploy (non-interactive)${RESET}"
say ""
say "  App name:      $APP_NAME"
say "  Region:        $REGION"
say "  Webhook URL:   $WEBHOOK_URL"
say "  Fly user:      $FLY_USER"
say "  APP_ID:        $APP_ID"
say "  PEM file:      $PEM_PATH ($(wc -c < "$PEM_PATH") bytes)"
say ""

# ----- Optional: destroy first -----
if [ "${DESTROY:-false}" = "true" ]; then
  warn "DESTROY=true → destroying existing $APP_NAME app"
  fly apps destroy --app "$APP_NAME" --yes || warn "No existing app to destroy"
fi

# ----- Launch (idempotent — fly launch detects existing app) -----
say "${BOLD}📦 Launching app...${RESET}"
if [ -f "fly.toml" ] && grep -q "^app = \"$APP_NAME\"" fly.toml; then
  ok "fly.toml already configured for $APP_NAME — skipping launch"
else
  fly launch --no-deploy \
    --name "$APP_NAME" \
    --region "$REGION" \
    --internal-port 3000 \
    --auto-stop-machines false
  ok "Created fly.toml"
fi

# ----- Convert PEM to single-line for Fly secret -----
PEM_ESCAPED=$(sed ':a;N;$!ba;s/\n/\\n/g' "$PEM_PATH")

# ----- Set secrets -----
say ""
say "${BOLD}🔐 Setting secrets...${RESET}"
fly secrets set \
  --app "$APP_NAME" \
  APP_ID="$APP_ID" \
  WEBHOOK_SECRET="$WEBHOOK_SECRET" \
  PRIVATE_KEY="$PEM_ESCAPED"
ok "Secrets set"

# ----- Deploy -----
if [ "${SKIP_DEPLOY:-false}" = "true" ]; then
  warn "SKIP_DEPLOY=true — skipping deploy"
else
  say ""
  say "${BOLD}📦 Deploying...${RESET}"
  fly deploy --app "$APP_NAME"

  # ----- Verify -----
  say ""
  say "${BOLD}🩺 Verifying...${RESET}"
  sleep 5
  for i in 1 2 3 4 5; do
    if RESPONSE=$(curl -fs "$WEBHOOK_URL" 2>/dev/null); then
      ok "Bot is live at $WEBHOOK_URL"
      say "Response: $RESPONSE"
      break
    else
      warn "Attempt $i: not responding yet, waiting 5s..."
      sleep 5
    fi
  done
fi

# ----- Done -----
cat <<EOF

${GREEN}${BOLD}🎉 Deploy complete!${RESET}

Your webhook URL: ${BOLD}${WEBHOOK_URL}${RESET}

${BOLD}Next steps:${RESET}

1. Update your GitHub App's webhook URL:
   https://github.com/settings/apps → your App → Webhook → set to:
   ${BOLD}${WEBHOOK_URL}${RESET}

2. Make sure Webhook secret on the App matches:
   ${BOLD}${WEBHOOK_SECRET}${RESET}

3. Install the App:
   ${BOLD}https://github.com/apps/${APP_NAME}${RESET}

4. Test by commenting on any issue/PR:
   ${BOLD}:sipmap /help${RESET}

${BOLD}Useful commands:${RESET}
  fly logs --app ${APP_NAME}              # live logs
  fly status --app ${APP_NAME}            # check health
  fly open --app ${APP_NAME}              # open in browser
  fly secrets list --app ${APP_NAME}      # list secrets (redacted)
  fly destroy --app ${APP_NAME}           # tear it down
EOF
