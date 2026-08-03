#!/usr/bin/env bash
# sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
# Fetch owner-visible stats for the sipmap GitHub App and repo.
#
# This script is OWNER-ONLY: it refuses to run unless your GitHub
# authentication matches $SIPMAP_OWNER (default: muditagrawal2007).
#
# Usage:
#   scripts/fetch-stats.sh
#
# Override the owner (for forks):
#   SIPMAP_OWNER=your-username scripts/fetch-stats.sh
#
# Requirements:
#   - Either `gh` CLI authenticated as the owner, OR
#   - GITHUB_TOKEN env var belonging to the owner (fine-grained PAT or App token)

set -euo pipefail

EXPECTED_OWNER="${SIPMAP_OWNER:-muditagrawal2007}"
REPO_NAME="sipmap"

# Colors (disabled if NO_COLOR set or not a TTY)
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD='\033[1m'
  DIM='\033[2m'
  RESET='\033[0m'
  CYAN='\033[36m'
  YELLOW='\033[33m'
else
  BOLD=''; DIM=''; RESET=''; CYAN=''; YELLOW=''
fi

# ----- 1. Authenticate -----
if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  AUTH_USER=$(gh api user --jq '.login')
  # Pull the OAuth token so curl can use it too.
  GITHUB_TOKEN="${GITHUB_TOKEN:-$(gh auth token 2>/dev/null)}"
  AUTH_CMD="curl -fsH \"Authorization: token \$GITHUB_TOKEN\""
elif [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_USER=$(curl -fsH "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | jq -r '.login // empty' 2>/dev/null || echo "")
  AUTH_CMD="curl -fsH \"Authorization: token \$GITHUB_TOKEN\""
else
  echo "❌ Not authenticated. Either:"
  echo "   - Run \`gh auth login\` and re-run, or"
  echo "   - Set GITHUB_TOKEN (fine-grained PAT or App token) and re-run."
  exit 1
fi

# ----- 2. Ownership check -----
if [ "$AUTH_USER" != "$EXPECTED_OWNER" ]; then
  echo "🚫 Access denied."
  echo "   This script is OWNER-ONLY."
  echo "   Expected owner: ${EXPECTED_OWNER}"
  echo "   Your login:     ${AUTH_USER}"
  echo ""
  echo "If you forked sipmap and want to see YOUR fork's stats, set:"
  echo "   SIPMAP_OWNER=${AUTH_USER} $0"
  exit 2
fi

# ----- 3. Fetch and print stats -----
echo "${BOLD}${CYAN}📊 sipmap stats for ${EXPECTED_OWNER}/${REPO_NAME}${RESET}"
echo "${DIM}─────────────────────────────────────────────────────────${RESET}"

# App installations
if command -v gh >/dev/null 2>&1; then
  INSTALLS_RAW=$(gh api /app/installations 2>&1 || true)
  if echo "$INSTALLS_RAW" | grep -q '"login"'; then
    INSTALLS=$(echo "$INSTALLS_RAW" | jq 'length')
    ACTIVE=$(echo "$INSTALLS_RAW" | jq '[.[] | select(.suspended_at==null)] | length')
    SUSPENDED=$(echo "$INSTALLS_RAW" | jq '[.[] | select(.suspended_at!=null)] | length')
    echo "${BOLD}App installations:${RESET}        ${YELLOW}${INSTALLS}${RESET}"
    echo "  ${DIM}active:               ${ACTIVE}${RESET}"
    echo "  ${DIM}suspended:            ${SUSPENDED}${RESET}"
  else
    echo "${BOLD}App installations:${RESET}        ${DIM}n/a (needs App token, not user OAuth)${RESET}"
    echo "  ${DIM}Generate one with: see docs/usage-stats.md${RESET}"
  fi
else
  echo "${BOLD}App installations:${RESET}        ${DIM}(requires \`gh\` CLI for App endpoints)${RESET}"
fi

# Stars / forks (use jq for reliable JSON parsing)
REPO_JSON=$(curl -fsH "Authorization: token ${GITHUB_TOKEN:-}" \
  "https://api.github.com/repos/${EXPECTED_OWNER}/${REPO_NAME}" 2>/dev/null || echo "")
if [ -n "$REPO_JSON" ] && command -v jq >/dev/null 2>&1; then
  STARS=$(echo "$REPO_JSON" | jq '.stargazers_count // 0')
  FORKS=$(echo "$REPO_JSON" | jq '.forks_count // 0')
  WATCHERS=$(echo "$REPO_JSON" | jq '.subscribers_count // 0')
  OPEN_ISSUES=$(echo "$REPO_JSON" | jq '.open_issues_count // 0')
  echo "${BOLD}Stars:${RESET}                    ${YELLOW}${STARS}${RESET}"
  echo "${BOLD}Forks:${RESET}                    ${YELLOW}${FORKS}${RESET}"
  echo "${BOLD}Watchers:${RESET}                 ${YELLOW}${WATCHERS}${RESET}"
  echo "${BOLD}Open issues:${RESET}              ${YELLOW}${OPEN_ISSUES}${RESET}"
else
  echo "${BOLD}Stars/Forks:${RESET}              ${DIM}(needs curl + jq; check \$GITHUB_TOKEN)${RESET}"
fi

# Clones
CLONES_JSON=$(curl -fsH "Authorization: token ${GITHUB_TOKEN:-}" \
  "https://api.github.com/repos/${EXPECTED_OWNER}/${REPO_NAME}/traffic/clones" 2>/dev/null || echo "")
if [ -n "$CLONES_JSON" ] && command -v jq >/dev/null 2>&1; then
  CLONE_COUNT=$(echo "$CLONES_JSON" | jq '.count // 0')
  CLONE_UNIQ=$(echo "$CLONES_JSON" | jq '.uniques // 0')
  echo "${BOLD}Clones (14d):${RESET}             ${YELLOW}${CLONE_COUNT}${RESET}  ${DIM}(${CLONE_UNIQ} unique)${RESET}"
fi

# Views
VIEWS_JSON=$(curl -fsH "Authorization: token ${GITHUB_TOKEN:-}" \
  "https://api.github.com/repos/${EXPECTED_OWNER}/${REPO_NAME}/traffic/views" 2>/dev/null || echo "")
if [ -n "$VIEWS_JSON" ] && command -v jq >/dev/null 2>&1; then
  VIEW_COUNT=$(echo "$VIEWS_JSON" | jq '.count // 0')
  VIEW_UNIQ=$(echo "$VIEWS_JSON" | jq '.uniques // 0')
  echo "${BOLD}Views (14d):${RESET}              ${YELLOW}${VIEW_COUNT}${RESET}  ${DIM}(${VIEW_UNIQ} unique)${RESET}"
fi

# Referrers
REFERRERS_JSON=$(curl -fsH "Authorization: token ${GITHUB_TOKEN:-}" \
  "https://api.github.com/repos/${EXPECTED_OWNER}/${REPO_NAME}/traffic/popular/referrers" 2>/dev/null || echo "")
if [ -n "$REFERRERS_JSON" ] && [ "$REFERRERS_JSON" != "[]" ] && command -v jq >/dev/null 2>&1; then
  echo ""
  echo "${BOLD}Top referrers:${RESET}"
  echo "$REFERRERS_JSON" | jq -r '.[] | "  \(.referrer // "direct")\t\(.count) visits (\(.uniques) unique)"' | head -5 | awk -F'\t' '{printf "  %-40s %s\n", $1, $2}'
fi

echo ""
echo "${DIM}Privacy: sipmap itself does no tracking. These numbers come from"
echo "GitHub's owner-visible APIs only. No data is collected from users.${RESET}"
echo "${DIM}See docs/usage-stats.md for full details.${RESET}"
