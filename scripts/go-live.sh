#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Open all the right URLs in your browser so you can complete setup with just a few clicks.
#
# Usage:
#   scripts/go-live.sh

set -e

echo ""
echo "🚀 Opening 3 tabs in your browser..."
echo ""
echo "TAB 1 (Fly.io signup) — Sign up, then come back here."
echo "TAB 2 (GitHub App) — Click Create, copy App ID + .pem key, then come back."
echo "TAB 3 (GO-LIVE guide) — Read alongside so you know what to do."
echo ""

# Open Fly.io signup
open "https://fly.io/app/sign-up" 2>/dev/null || xdg-open "https://fly.io/app/sign-up" 2>/dev/null || echo "Open https://fly.io/app/sign-up in your browser"

sleep 1

# Open GitHub App manifest registration
open "https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml" 2>/dev/null \
  || xdg-open "https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml" 2>/dev/null \
  || echo "Open https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml in your browser"

sleep 1

# Open the GO-LIVE guide
open "https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md" 2>/dev/null \
  || xdg-open "https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md" 2>/dev/null \
  || echo "Open https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md in your browser"

cat <<'EOF'

=========================================================
TABS OPENED. Now do this:

In Tab 1 (Fly.io):
  - Sign up with email + password
  - Verify your email
  - When you see "Welcome to Fly.io", you're done with this tab

In Tab 2 (GitHub App):
  - The form is pre-filled. Just click the green "Create" button
  - On the App settings page, scroll to "Webhook secret" and paste:
        sipmap-shared-secret-2026
  - Scroll to "Private keys", click "Generate a private key"
  - A .pem file downloads. Move it to:
        /Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem
  - Note the "App ID" number at the top (something like 987654)

After both tabs are done, run ONE command:

  APP_ID=YOUR_NUMBER_HERE \
  WEBHOOK_SECRET=sipmap-shared-secret-2026 \
  PEM_PATH=./app-private-key.pem \
  scripts/deploy-fly-auto.sh

(Replace YOUR_NUMBER_HERE with the App ID from Tab 2.)

That single command will:
  ✓ Log you into Fly.io (browser may pop up — just click "Authorize")
  ✓ Create the sipmap app on Fly.io
  ✓ Set your 3 secrets
  ✓ Deploy the bot
  ✓ Print your webhook URL when done

Then ONE more thing — go back to Tab 2 (GitHub App):
  - Click "Webhook" in the left sidebar
  - Paste the URL the script printed (looks like https://sipmap.fly.dev/)
  - Save

DONE! Visit https://github.com/apps/sipmap → Install → Test.

=========================================================
EOF
