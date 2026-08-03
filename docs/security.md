# Security & privacy

sipmap is built with privacy and safety as defaults. This document is the threat model and guarantees.

## Guarantees

### 1. No information leaks
- **No telemetry.** No analytics SDKs. No error reporting to third parties.
- **No external API calls** beyond GitHub's REST/GraphQL API.
- **Logs only** `{event, repo_id, command, actor_login}` — never tokens, emails, comment bodies, file contents, or PR titles.
- **Logger redacts** known secret formats (GitHub PATs, AWS keys, Slack tokens, PEM blocks, email addresses) at the pattern layer and the path layer.

### 2. Zero Actions consumption
- sipmap **never** triggers GitHub Actions workflows (`createWorkflowDispatch`, `reRunWorkflow`, etc.).
- Verified by `scripts/verify-no-actions-trigger.sh` in CI on every PR.
- Verified by `test/security/no-actions-trigger.test.js` (grep-based static check).
- Bot's own CI doesn't include `schedule:` triggers.

### 3. Narrow permissions
- `contents:read`, `issues:write`, `pull_requests:write`, `checks:read`, `metadata:read`.
- **No** `actions:write`, `email`, `members`, `administration`, or any other broader scope.
- Verified by `test/security/permissions-narrow.test.js`.

### 4. Maintainer gating
- Privileged commands (`/assign`, `/label`, `/review`, `/close`, `/config`, etc.) call `repos.getCollaboratorPermissionLevel` first and refuse if the caller isn't a maintainer/admin.
- The denial message is friendly and suggests how to get access.

### 5. Anti-flood
- Per-user-per-PR, per-PR, per-repo hourly rate limits.
- Debounce: same user + same command + same PR within 10 min → silently ignored.
- All limits configurable in `.sipmap.yml`.

### 6. Attribution preserved
- Original repo owner `muditagrawal2007` (MUDIT AGRAWAL) is in `LICENSE`, `NOTICE`, `AUTHORS.md`, `CITATION.cff`, `.github/CODEOWNERS`, and README.
- `.github/CODEOWNERS` requires PR review by `@muditagrawal2007` on every PR to the original repo.

## What sipmap does NOT do

- Does not collect, store, or forward any personal data to third parties.
- Does not run scheduled background jobs that accumulate cost.
- Does not write to the user's repo (only reads `.sipmap.yml` and templates).
- Does not call any Actions write endpoint.
- Does not include any analytics / error reporting / telemetry SDK.

## What sipmap WILL post publicly

- Encouragement comments on PRs and issues (configurable).
- Process-testing digests (only when `:sipmap /test` is invoked).
- Reactions on issue/PR comments (configurable).

These are visible to anyone with repo access, by design.

## Reporting a vulnerability

Open an issue at https://github.com/muditagrawal2007/sipmap/issues (private if you can) and we'll respond.
