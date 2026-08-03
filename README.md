# sipmap

> A free, open-source GitHub App that helps maintainers with **process testing**, sends notifications to the right people, and **encourages contributors** — without costing anyone a cent.

Created by **[@muditagrawal2007](https://github.com/muditagrawal2007)** (MUDIT AGRAWAL).

## What is sipmap?

sipmap is a GitHub App you install into any repo. Once installed, it reacts to comments like:

```
:sipmap /help
:sipmap /test
:sipmap /review
```

…and it runs **process testing** (template validation, CI status, secret scans, branch conventions, etc.), **notifies maintainers**, and posts **encouragement** for contributors (first-time PRs, milestones, helpful reviews, streaks, etc.).

## ✨ Highlights

- 🎯 **Process testing** — `:sipmap /test` runs a digest of PR checks
- 📣 **Maintainer handoff** — `:sipmap /review` pings the right people
- 🎉 **Encouragement** — auto-comments for first-timers, milestones, helpful reviewers
- 📝 **Description validation** — `:sipmap /describe` checks PR/issue templates
- 🔒 **Zero info leaks** — no telemetry, no external APIs beyond GitHub
- 💸 **Zero cost** — MIT licensed, free hosting on Glitch/Render/Fly/self-host
- 🚫 **Zero Actions consumption** — never triggers GitHub Actions workflows; uses no Actions minutes
- 🛡️ **Narrow permissions** — only the minimum needed: contents read, issues write, PRs write, checks read

## 🚀 Install (for users)

### Option 1 — Per-repo install (60 seconds)

1. Open: `https://github.com/apps/sipmap` (or your own manifest-provisioned App URL)
2. Click **Install**
3. Pick a repo
4. Done — type `:sipmap /help` on any issue or PR

### Option 2 — Share via CONTRIBUTING.md

Add this to your repo's `CONTRIBUTING.md` so contributors can install sipmap in their own repos:

```markdown
## 💬 Use sipmap in your own repos
sipmap is free & open-source. Install it in your own repos:
👉 https://github.com/apps/sipmap
```

### Option 3 — Org-wide install

Org owners can install once for all current and future repos from the same App page.

## 🛠️ Setup (for the owner)

To make `https://github.com/apps/sipmap` go live, you (the owner) must:

1. **Register the GitHub App** — see [`docs/app-registration.md`](./docs/app-registration.md)
2. **Host the bot on Fly.io (recommended, free, no sleep)**:
   ```bash
   brew install flyctl          # one-time
   fly auth signup              # one-time, browser OAuth
   scripts/deploy-fly.sh        # interactive, ~5 min
   ```
3. **Set the webhook URL** in the App's settings to your hosted bot's URL (e.g. `https://sipmap.fly.dev/`)
4. **Test** — install into one repo, comment `:sipmap /help`, verify the bot responds

Total cost: **$0**.

## 📋 Commands (cheat sheet)

| Command | What it does |
|---|---|
| `:sipmap /help` | List all commands |
| `:sipmap /test` | Run process-testing digest |
| `:sipmap /status` | Summarize CI checks |
| `:sipmap /lint` | Lint PR contents |
| `:sipmap /describe` | Validate description against template |
| `:sipmap /size` | Flag oversized PRs |
| `:sipmap /secrets` | Heuristic secret scan |
| `:sipmap /deps` | Detect dependency changes |
| `:sipmap /branch` | Validate branch name |
| `:sipmap /commits` | Validate commit messages |
| `:sipmap /title` | Validate PR title |
| `:sipmap /docs` | Check docs updated for code changes |
| `:sipmap /tests` | Check tests updated for source changes |
| `:sipmap /approvals` | Show approval status |
| `:sipmap /assign @user` | Assign reviewer (maintainer) |
| `:sipmap /claim` | Self-assign an issue |
| `:sipmap /thanks @user` | Manual kudos |
| `:sipmap /review` | Ping maintainers |
| `:sipmap /metrics @user` | Show contributor stats |
| `:sipmap /config` | Show effective config (maintainer) |

Maintainer-only commands: `/good-first-issue`, `/help-wanted`, `/label`, `/unlabel`, `/close`, `/reopen`, `/lock`, `/pin`, `/weekly-digest`, `/config set`.

## ⚙️ Configuration

Drop a `.sipmap.yml` in your repo's default branch. See [`.sipmap.yml.example`](./.sipmap.yml.example) for the full reference.

## 🛡️ Security & privacy

- **No telemetry.** No analytics SDKs. No error reporting to third parties.
- **No external API calls** beyond GitHub's REST/GraphQL API.
- **Logs only** `{event, repo_id, command, actor_login}` — never tokens, emails, or comment bodies.
- **Never triggers GitHub Actions workflows** — uses zero Actions minutes.
- **Narrow permissions.** Read the security model in [`docs/security.md`](./docs/security.md).

See [`docs/cost.md`](./docs/cost.md) for a full zero-cost breakdown.

## 🏗️ Self-host

The bot is a standard [Probot](https://probot.github.io/) app. Self-host anywhere:

- **Fly.io (recommended)**: see [`docs/self-host.md`](./docs/self-host.md) (free, no sleep, $0)
- **Render**: see [`docs/self-host.md`](./docs/self-host.md) (one-click GitHub deploy, sleeps on free tier)
- **Docker / local + Cloudflare Tunnel**: see [`docs/self-host.md`](./docs/self-host.md)

> ⚠️ Glitch is no longer a viable host. See [`docs/glitch.md`](./docs/glitch.md) for historical context.

One-command deploy to Fly.io:

```bash
brew install flyctl
fly auth signup
scripts/deploy-fly.sh
```

## 🧪 Development

```bash
npm install
npm run lint
npm test -- --coverage
npm run verify:all   # confirms zero-cost + zero Actions triggers
```

## 📚 Documentation

- [`docs/install.md`](./docs/install.md) — installation guide
- [`docs/app-registration.md`](./docs/app-registration.md) — owner: register the GitHub App
- [`docs/self-host.md`](./docs/self-host.md) — owner: Fly.io (recommended) / Render / Docker
- [`docs/glitch.md`](./docs/glitch.md) — Glitch (discontinued, kept for reference)
- [`docs/commands.md`](./docs/commands.md) — full command reference
- [`docs/encouragements.md`](./docs/encouragements.md) — encouragement triggers
- [`docs/config.md`](./docs/config.md) — `.sipmap.yml` reference
- [`docs/security.md`](./docs/security.md) — privacy & security model
- [`docs/cost.md`](./docs/cost.md) — zero-cost breakdown
- [`docs/testing.md`](./docs/testing.md) — how to run & extend tests
- [`docs/usage-stats.md`](./docs/usage-stats.md) — owner-only stats guide

## 👤 Author

**MUDIT AGRAWAL** ([@muditagrawal2007](https://github.com/muditagrawal2007)) — created in 2026.

This repository is owned and copyright-protected by MUDIT AGRAWAL. `.github/CODEOWNERS` requires review on every PR, and the LICENSE copyright line preserves attribution permanently.

## 📈 Usage stats (owner-only)

To see how many people installed sipmap, how many cloned the repo, and where the traffic comes from, see [`docs/usage-stats.md`](./docs/usage-stats.md). The script refuses to run unless you're authenticated as `muditagrawal2007` (or whatever owner you set via `SIPMAP_OWNER`).

```bash
scripts/fetch-stats.sh
```

sipmap itself does **no tracking** — every metric comes from GitHub's owner-visible APIs.

## 📄 License

MIT — see [`LICENSE`](./LICENSE). Free for any use.
