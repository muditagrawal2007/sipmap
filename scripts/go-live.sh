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
echo "TAB 1 (Render signup) — Sign up with GitHub, no credit card needed."
echo "TAB 2 (GitHub App) — Click Create, copy App ID + .pem key."
echo "TAB 3 (GO-LIVE guide) — Read alongside so you know what to do."
echo ""

# Open Render signup
open "https://render.com/register" 2>/dev/null || xdg-open "https://render.com/register" 2>/dev/null || echo "Open https://render.com/register in your browser"

sleep 1

# Open GitHub App manifest registration
open "https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.json" 2>/dev/null \
  || xdg-open "https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.json" 2>/dev/null \
  || echo "Open https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.json in your browser"

sleep 1

# Open the GO-LIVE guide
open "https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md" 2>/dev/null \
  || xdg-open "https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md" 2>/dev/null \
  || echo "Open https://github.com/muditagrawal2007/sipmap/blob/main/docs/GO-LIVE.md in your browser"

cat <<'EOF'

=========================================================
TABS OPENED. Now do this:

In Tab 1 (Render):
  - Click "Sign up with GitHub"
  - Authorize Render
  - You're done with this tab

In Tab 2 (GitHub App):
  - The form is pre-filled. Webhook URL is set to https://sipmap.onrender.com/
  - Just click the green "Create" button
  - On the App settings page, scroll to "Webhook secret" and paste:
        sipmap-shared-secret-2026
  - Scroll to "Private keys", click "Generate a private key"
  - A .pem file downloads. Move it to:
        /Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem
  - Note the "App ID" number at the top (something like 987654)

After both tabs are done, in your terminal run:

  mv ~/Downloads/muditagrawal2007-sipmap.*.pem ./app-private-key.pem 2>/dev/null || true

Then in your browser:
  - Open https://dashboard.render.com/blueprints
  - Click "New Blueprint Instance"
  - Select the muditagrawal2007/sipmap repo
  - Click "Apply"
  - Wait ~2 minutes for the build

Then in Render dashboard → sipmap service → Environment:
  - APP_ID = (paste your App ID number)
  - WEBHOOK_SECRET = sipmap-shared-secret-2026
  - PRIVATE_KEY = (run this in terminal first, then paste output):
        cat app-private-key.pem | sed ':a;N;$!ba;s/\n/\\n/g'

DONE! Visit https://github.com/apps/sipmap → Install → Test.

=========================================================
EOF
