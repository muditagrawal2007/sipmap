# Registering the sipmap GitHub App

Before users can install sipmap, you (the owner) need to **register a GitHub App** under your account. This is a one-time setup that takes ~5 minutes.

There are **two ways** to register: via the manifest URL (recommended, auto-fills everything) or via the manual form.

## Option A — Register via manifest (recommended, 90 seconds)

The repo ships an `app.yml` manifest with all the right permissions, events, and metadata pre-filled.

### Steps

1. Visit this URL in your browser:

   ```
   https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml
   ```

   *(Replace `muditagrawal2007/sipmap` with your fork's path if you've forked it.)*

2. GitHub will load the manifest and show a preview. Review the settings:

   | Field | Value (from app.yml) |
   |---|---|
   | Name | `sipmap` |
   | Homepage URL | `https://github.com/muditagrawal2007/sipmap` |
   | Webhook URL | **placeholder** — replace with your host (see step 3) |
   | Permissions | contents (read), issues (write), pull_requests (write), checks (read), metadata (read) |
   | Events | issue_comment, issues, pull_request, pull_request_review, pull_request_review_comment, check_run, check_suite |
   | Public | ✓ |

3. **Before clicking "Create":** edit the **Webhook URL** field to point to your bot's public URL:
   - **Glitch**: `https://<your-project>.glitch.me/`
   - **Fly.io**: `https://<your-app>.fly.dev/`
   - **Render**: `https://<your-service>.onrender.com/`
   - **Self-hosted**: `https://<your-domain>/`

   *(You can change this later in the App's settings, so a placeholder is fine for now.)*

4. Click **Create**. GitHub registers the App under your account.

5. You're taken to the App's settings page. **Save these values** — you'll need them:
   - **App ID** (numeric, top of the General tab)
   - **Client ID / Client secret** (also General tab)
   - **Private key** — click "Generate a private key" → a `.pem` file downloads

6. On the same page, set **Webhook secret** to a random string:
   ```bash
   openssl rand -hex 32
   ```

## Option B — Manual registration

If the manifest URL doesn't work for some reason:

1. Visit https://github.com/settings/apps/new
2. Fill in the form using the values from the table above.
3. After saving, manually download the private key from the General tab.

## After registration: make the App public

By default, GitHub Apps you create are **private** (only you can install them). To let anyone install:

1. On the App's settings page, scroll to **Public page** in the left sidebar.
2. Click **Make public** (or the App is already public if you ticked the box in the manifest).

The install URL becomes:

```
https://github.com/apps/sipmap
```

This is the URL users see when they want to install the bot.

## After registration: set up hosting

The App needs a webhook listener (a server running 24/7 that receives GitHub events). Pick one:

| Host | Cost | Sleep? | See |
|---|---|---|---|
| Glitch | $0 | Yes (5 min) | [`docs/glitch.md`](./glitch.md) |
| Fly.io | $0 | No | [`docs/self-host.md`](./self-host.md) |
| Render | $0 | Yes (15 min) | [`docs/self-host.md`](./self-host.md) |
| Your machine | $0 | No | [`docs/self-host.md`](./self-host.md) |

Once your host is running and reachable, go back to the App's **Webhook** settings:

- **Webhook URL**: the public URL of your hosted bot
- **Webhook secret**: the same value as in your host's `.env`

Save. GitHub will send a `ping` event to verify.

## Verify installation works

1. Visit `https://github.com/apps/sipmap`
2. Click **Install** → pick one of your repos
3. In an issue on that repo, comment `:sipmap /help`
4. Bot should reply within ~10 seconds

## Multi-installation notes

- Each installation is **isolated**. Installing sipmap into your own repo doesn't affect anyone else's install.
- The App owner (you) can see all installations at https://github.com/settings/apps → your App → **Installations** tab.
- For org-wide installs, an org owner must initiate the install. Individual members can't.

## Re-registration

You can re-register the same App under your account by re-using the manifest URL — it creates a brand-new App with a fresh ID and private key. The old App remains active until you delete it.

## Deletion

If you ever want to delete the App:

1. https://github.com/settings/apps → click your App
2. Click **Delete app** at the bottom of the General tab.

After deletion, all existing installations stop receiving events.

---

*Owner: MUDIT AGRAWAL — [@muditagrawal2007](https://github.com/muditagrawal2007)*
