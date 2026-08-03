#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# One-command Fly.io deployment for sipmap.
#
# Prerequisites:
#   - `flyctl` installed: brew install flyctl
#   - Fly.io account: `fly auth signup` (free tier; credit card required but not charged)
#   - GitHub App registered with APP_ID and a downloaded .pem private key
#   - Webhook secret chosen (or generated)
#
# Usage:
#   scripts/deploy-fly.sh
#
# After this runs, your bot is live at https://<app-name>.fly.dev/

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
warn() { say "${YELLOW}⚠ $*${RESET}"; }
die()  { say "${RED}❌ $*${RESET}"; exit 1; }
ok()   { say "${GREEN}✅ $*${RESET}"; }

# ----- 1. Check prerequisites -----
say "${BOLD}🔍 sipmap → Fly.io deploy${RESET}"

command -v fly >/dev/null 2>&1 || die "flyctl not installed. Install with: brew install flyctl"
ok "flyctl found: $(fly version)"

# Check if logged in
if ! fly auth whoami >/dev/null 2>&1; then
  die "Not logged in to Fly.io. Run: fly auth signup (or fly auth login)"
fi
FLY_USER=$(fly auth whoami | head -1 | awk -F '@' '{print $1}' | tr -d ' ')
ok "Logged in to Fly.io as $FLY_USER"

# ----- 2. Choose app name -----
DEFAULT_NAME="sipmap"
read -r -p "App name [$DEFAULT_NAME]: " APP_NAME
APP_NAME="${APP_NAME:-$DEFAULT_NAME}"
APP_NAME=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]-')
ok "App name: $APP_NAME"
WEBHOOK_URL="https://${APP_NAME}.fly.dev/"

# ----- 3. Choose region -----
say "${BOLD}Common regions:${RESET} sin (Singapore), iad (US East), fra (Frankfurt), syd (Sydney), lax (US West)"
read -r -p "Region [sin]: " REGION
REGION="${REGION:-sin}"

# ----- 4. Gather secrets -----
say ""
say "${BOLD}Now I need your GitHub App secrets.${RESET}"
say "  - Register the App first at: https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml"
say "  - Get APP_ID from the App's General tab (numeric)"
say "  - Get the .pem private key (click 'Generate a private key' on General tab)"
say ""

read -r -p "APP_ID: " APP_ID
[ -n "$APP_ID" ] || die "APP_ID required"

if [ -z "${WEBHOOK_SECRET:-}" ]; then
  read -r -s -p "WEBHOOK_SECRET (Enter to auto-generate): " WEBHOOK_SECRET_INPUT
  echo ""
  if [ -z "$WEBHOOK_SECRET_INPUT" ]; then
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    say "Generated WEBHOOK_SECRET: $WEBHOOK_SECRET"
    say "${YELLOW}⚠ SAVE THIS — paste it into your GitHub App's Webhook secret field${RESET}"
  else
    WEBHOOK_SECRET="$WEBHOOK_SECRET_INPUT"
  fi
fi

# Find or read PEM file
PEM_PATH=""
if [ -f "${1:-}" ]; then PEM_PATH="$1"; fi
if [ -z "$PEM_PATH" ]; then
  read -r -p "Path to .pem private key file: " PEM_PATH
fi
[ -f "$PEM_PATH" ] || die "PEM file not found: $PEM_PATH"

# Convert PEM to single-line for Fly secret
PEM_ESCAPED=$(sed ':a;N;$!ba;s/\n/\\n/g' "$PEM_PATH")
ok "Read PEM from $PEM_PATH ($(wc -c < "$PEM_PATH") bytes)"

# ----- 5. Launch app -----
say ""
say "${BOLD}🚀 Launching app '$APP_NAME' on Fly.io ($REGION)...${RESET}"

# Only create fly.toml if it doesn't already exist for this app
if [ ! -f "fly.toml" ]; then
  fly launch --no-deploy \
    --name "$APP_NAME" \
    --region "$REGION" \
    --internal-port 3000 \
    --auto-stop-machines false
  ok "Created fly.toml"
else
  warn "fly.toml already exists — skipping launch"
fi

# ----- 6. Set secrets -----
say ""
say "${BOLD}🔐 Setting secrets...${RESET}"
fly secrets set \
  --app "$APP_NAME" \
  APP_ID="$APP_ID" \
  WEBHOOK_SECRET="$WEBHOOK_SECRET" \
  PRIVATE_KEY="$PEM_ESCAPED"
ok "Secrets set"

# ----- 7. Deploy -----
say ""
say "${BOLD}📦 Deploying...${RESET}"
fly deploy --app "$APP_NAME"

# ----- 8. Verify -----
say ""
say "${BOLD}🩺 Verifying...${RESET}"
sleep 3
if curl -fs "$WEBHOOK_URL" >/dev/null 2>&1; then
  RESPONSE=$(curl -fs "$WEBHOOK_URL")
  ok "Bot is live at $WEBHOOK_URL"
  say "Response: $RESPONSE"
else
  warn "Bot not responding yet at $WEBHOOK_URL"
  warn "Check logs with: fly logs --app $APP_NAME"
fi

# ----- 9. Next steps -----
cat <<EOF

${GREEN}${BOLD}🎉 Deploy complete!${RESET}

${BOLD}Next steps:${RESET}

1. Update your GitHub App's webhook URL:
   ${BOLD}https://github.com/settings/apps${RESET} → your App → Webhook → set to:
   ${BOLD}${WEBHOOK_URL}${RESET}

2. Make sure the ${BOLD}Webhook secret${RESET} on the App matches:
   ${BOLD}${WEBHOOK_SECRET}${RESET}

3. Install the App:
   ${BOLD}https://github.com/apps/${APP_NAME}${RESET}

4. Test by commenting on any issue or PR:
   ${BOLD}:sipmap /help${RESET}

${BOLD}Useful commands:${RESET}
  fly logs --app ${APP_NAME}              # live logs
  fly status --app ${APP_NAME}            # check health
  fly open --app ${APP_NAME}              # open in browser
  fly ssh console --app ${APP_NAME}       # SSH into container
  fly secrets list --app ${APP_NAME}      # list secrets (values redacted)
  fly destroy --app ${APP_NAME}           # delete the app

${BOLD}Cost:${RESET} \$0 (Fly.io free tier: 3 shared VMs, 256 MB RAM each)
EOF
