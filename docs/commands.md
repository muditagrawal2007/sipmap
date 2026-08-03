# Commands reference

> Trigger any command by commenting on an issue or PR: `:sipmap /<command>`

## Anyone can use these

| Command | Description |
|---|---|
| `:sipmap /help` | Show all commands |
| `:sipmap /test` | Run process-testing digest (template, branch, commits, secrets, conflicts, description, CI) |
| `:sipmap /status` | Summarize CI check-runs |
| `:sipmap /lint` | Lightweight PR file checks (conflicts, secrets, large files) |
| `:sipmap /describe` | Validate PR/issue description against template |
| `:sipmap /size` | Flag oversized PRs (XS/S/M/L/XL) |
| `:sipmap /secrets` | Heuristic secret scan (GitHub PATs, AWS, Slack, PEM, high-entropy) |
| `:sipmap /deps` | Detect dependency manifest changes |
| `:sipmap /branch` | Validate branch name against `.sipmap.yml` pattern |
| `:sipmap /commits` | Validate commit messages against pattern |
| `:sipmap /title` | Validate PR/issue title (length, placeholder) |
| `:sipmap /docs` | Check if docs were updated when source changed |
| `:sipmap /tests` | Check if tests were updated when source changed |
| `:sipmap /approvals` | Show PR approval status |
| `:sipmap /claim` | Self-assign this issue |
| `:sipmap /unclaim` | Release self-assignment |
| `:sipmap /thanks @user` | Manual kudos + reaction |
| `:sipmap /metrics @user` | Show contributor stats |

## Maintainer-only

> Requires maintainer/admin permission on the repo.

| Command | Description |
|---|---|
| `:sipmap /assign @user` | Assign reviewer |
| `:sipmap /unassign @user` | Remove reviewer |
| `:sipmap /good-first-issue` | Apply `good first issue` label |
| `:sipmap /help-wanted` | Apply `help wanted` label |
| `:sipmap /label <names>` | Apply labels |
| `:sipmap /unlabel <names>` | Remove labels |
| `:sipmap /review` | Ping maintainers with summary (uses CODEOWNERS or fallback handles) |
| `:sipmap /close [reason]` | Close issue/PR with reason |
| `:sipmap /reopen` | Reopen issue/PR |
| `:sipmap /lock` | Lock conversation |
| `:sipmap /pin` | Pin to repo (issues) |
| `:sipmap /weekly-digest` | Post weekly contributor digest to a configured issue |
| `:sipmap /config` | Show effective config |
