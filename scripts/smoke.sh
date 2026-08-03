#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Manual end-to-end smoke test against a real test repo.
# Usage: scripts/smoke.sh <owner/repo>
# Requires: gh CLI authenticated, sipmap installed in the target repo.

set -euo pipefail

REPO="${1:-}"

if [ -z "$REPO" ]; then
  echo "Usage: $0 <owner/repo>"
  echo "Example: $0 myuser/sipmap-test"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ gh CLI not installed. Install from https://cli.github.com/"
  exit 1
fi

echo "🧪 Running smoke test against $REPO…"

# 1. Open a test issue.
ISSUE_URL=$(gh issue create \
  --repo "$REPO" \
  --title "sipmap smoke test" \
  --body "This issue was opened by scripts/smoke.sh to verify sipmap is responding." \
  --label "smoke-test" 2>/dev/null || true)

if [ -z "$ISSUE_URL" ]; then
  echo "❌ Could not create test issue."
  exit 1
fi

ISSUE_NUM=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')
echo "✅ Created issue #$ISSUE_NUM"

# 2. Post a /help command.
gh issue comment "$ISSUE_NUM" --repo "$REPO" --body ":sipmap /help"
echo "✅ Posted :sipmap /help — wait ~10s for bot to respond…"
sleep 10

# 3. Verify response.
COMMENTS=$(gh api "repos/$REPO/issues/$ISSUE_NUM/comments" --jq 'length')
if [ "$COMMENTS" -lt 2 ]; then
  echo "❌ Expected ≥ 2 comments on issue (1 + bot reply). Got $COMMENTS."
  exit 1
fi

echo "✅ sipmap responded! $COMMENTS comment(s) on issue #$ISSUE_NUM."
echo "🧹 Cleaning up test issue…"

gh issue close "$ISSUE_NUM" --repo "$REPO" --comment "Closing smoke-test issue." >/dev/null

echo "🎉 Smoke test passed."
