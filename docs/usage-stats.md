# sipmap usage stats (owner-only)

> **This page is for the bot's owner (MUDIT AGRAWAL — `muditagrawal2007`).**
>
> If you are not the owner, you can fork sipmap under your own GitHub account and run the same commands — but the data you'll see will be from **your** fork, not from `muditagrawal2007/sipmap`.

## Why this is owner-only

The stats below come from GitHub's owner-visible APIs and dashboards. They include:

- **App installation counts** — visible only to the GitHub App owner.
- **Repo clone / view / referrer data** — visible only to the repo owner.
- **Star / fork counts** — public, but the curl examples here use a token.

sipmap itself **never collects or reports usage data**. Every metric on this page is fetched live from GitHub using the owner's credentials. Repos that install sipmap do not send anything back.

## 1. App installations

How many people have installed the sipmap GitHub App, and into which repos.

### Web UI

```
https://github.com/settings/apps/sipmap
```

Click the **Installations** tab in the left sidebar. You'll see every account (user or org) that has installed the App, broken down by status (`Active` / `Suspended` / `New`).

### API

```bash
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/app/installations | jq '.[].account.login'
```

This returns the list of accounts (users or orgs) that have installed the App. To count:

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/app/installations | jq 'length'
```

To count by status:

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/app/installations \
  | jq 'group_by(.suspended_at // "active") | map({(.[0].suspended_at // "active"): length}) | add'
```

### Permissions required

The token must have the GitHub App's **owner permissions** — i.e. you must be the App owner. Use a **GitHub App's installation token** minted from your own App, or a **fine-grained PAT** with `Administration: Read` on the App.

## 2. Repository clones ("downloads")

`git clone` counts over the last 14 days (UI) or 90 days (API).

### Web UI

```
https://github.com/muditagrawal2007/sipmap/insights/traffic
```

Click the **Clones** tab.

### API

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/muditagrawal2007/sipmap/traffic/clones | jq
```

Sample output:

```json
{
  "count": 156,
  "uniques": 78,
  "clones": [
    { "timestamp": "2026-07-21T00:00:00Z", "count": 12, "uniques": 8 },
    ...
  ]
}
```

- `count` — total `git clone` operations
- `uniques` — distinct cloners (by IP, hashed)
- `clones` — daily breakdown for the last 14 days

## 3. Repository views

How many people hit the repo page (even without cloning).

### Web UI

Same `/insights/traffic` page, **Traffic** tab.

### API

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/muditagrawal2007/sipmap/traffic/views | jq
```

Returns `count`, `uniques`, and `views` (daily breakdown).

## 4. Referrers

Where visitors came from.

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/muditagrawal2007/sipmap/traffic/popular/referrers | jq
```

Top referrers usually include:

- `github.com` (organic GitHub search)
- `news.ycombinator.com`
- `reddit.com`
- search engines

## 5. Stars and forks

```bash
curl -sH "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/muditagrawal2007/sipmap | jq '{stars: .stargazers_count, forks: .forks_count, watchers: .subscribers_count, open_issues: .open_issues_count}'
```

## 6. The one-command helper

If you have the `gh` CLI authenticated:

```bash
scripts/fetch-stats.sh
```

It will:

1. Verify your GitHub login is `muditagrawal2007` (or whatever `SIPMAP_OWNER` is set to).
2. Print a single-screen summary of installations, clones, views, referrers, stars, and forks.
3. Refuse to run if you're not the owner.

If you want to use it on a fork, override with `SIPMAP_OWNER=your-username scripts/fetch-stats.sh`.

## 7. Privacy guarantee (re-stated)

- sipmap's bot code does **no tracking**.
- This script does **no writing** — only reads via GitHub's public APIs.
- All data shown here comes from GitHub's own owner-visible dashboards.
- Repos that install sipmap send **nothing** back to you or anyone else.

For the full security model, see [`security.md`](./security.md).
For the cost model, see [`cost.md`](./cost.md).

---

*Owner: MUDIT AGRAWAL — [@muditagrawal2007](https://github.com/muditagrawal2007)*
