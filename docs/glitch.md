# Glitch (no longer a viable host)

> ⚠️ **Glitch discontinued its editing platform** in 2026. The site now redirects to `blog.glitch.com`. This guide is **kept for historical reference** and for users who happen to have an existing Glitch app.
>
> For new deployments, use **Fly.io** (free, no sleep). See [`docs/self-host.md`](./self-host.md) → "Option 1 — Fly.io".

---

# Glitch (kept for historical reference)

Glitch used to be the easiest free hosting for sipmap. **Cost: $0** (free tier + free UptimeRobot keep-alive).

## One-line summary

```
:remix-and-go: click the remix link below
:set-env-vars: paste APP_ID, WEBHOOK_SECRET, PRIVATE_KEY into .env
:set-webhook: update your GitHub App to point at https://YOUR-APP.glitch.me/
:keep-awake: add a UptimeRobot monitor to https://YOUR-APP.glitch.me/ every 5 min
:smoke-test: type :sipmap /help on any issue/PR — bot responds within ~10s
```

## Prerequisites

Before starting, you need:

1. **A GitHub App registered.** If you haven't registered one yet, follow [`docs/app-registration.md`](./app-registration.md) first. You'll need:
   - `APP_ID` (numeric)
   - A `.pem` private key file
   - A `WEBHOOK_SECRET` (you set this yourself)
2. **An existing Glitch app.** Glitch no longer supports new app creation.

## If you still have a working Glitch project

### Steps

#### 1. Configure secrets

In your Glitch project, click **`.env`** and fill in:

```bash
APP_ID=<your App numeric ID, e.g. 123456>
WEBHOOK_SECRET=<any random string, e.g. $(openssl rand -hex 32)>
PRIVATE_KEY="<paste your .pem file contents here. Keep the quotes and replace literal newlines with \n>"
PORT=3000
```

Click **Save** — Glitch auto-reboots.

#### 2. Get your webhook URL

Click **Share** → **Live App**. Copy the URL, e.g.:

```
https://my-sipmap.glitch.me
```

Test it: visit the URL in your browser. You should see:

```
sipmap is running.
```

#### 3. Update your GitHub App

Visit https://github.com/settings/apps → click your App → **Webhook** section:

- **Webhook URL**: `https://my-sipmap.glitch.me/`
- **Webhook secret**: paste the same `WEBHOOK_SECRET` you used in step 1
- Enable **SSL verification** ✓

#### 4. Keep it awake (free)

Glitch's free tier sleeps apps after 5 minutes of inactivity, causing ~30s delay on the first webhook after sleep. Use **UptimeRobot** (free) to keep the app alive:

1. Sign up at https://uptimerobot.com (free)
2. Click **+ Add New Monitor**
3. Configure:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: `sipmap keep-alive`
   - **URL**: `https://my-sipmap.glitch.me/`
   - **Monitoring Interval**: 5 minutes
4. Save

#### 5. Smoke test

Open any issue or PR in a repo where the App is installed and comment:

```
:sipmap /help
```

Within ~10 seconds, the bot replies with the full command list.

---

## ⚠️ Important

**Glitch is no longer a working host for new deployments.** This page is kept for users who happen to have an existing project.

For new deployments, use:
- **Fly.io** (recommended, free, no sleep) — [`docs/self-host.md`](./self-host.md) → Option 1
- **Render** (one-click GitHub deploy) — [`docs/self-host.md`](./docs/self-host.md) → Option 2
- **Cloudflare Tunnel** (run locally with free public URL) — [`docs/self-host.md`](./docs/self-host.md) → Option 3

If you don't have an existing Glitch project, **do not attempt to create one**. Use Fly.io or Render instead.

---

## One-command deploy for existing Glitch projects

If you already have a working Glitch project, use the existing one. The repo includes:

```bash
npm install
cp .env.example .env
# Fill in APP_ID, WEBHOOK_SECRET, PRIVATE_KEY
npm start
```

This works **exactly the same way** as on any other host, including:
- ✅ Fly.io
- ✅ Render
- ✅ Your machine + Cloudflare Tunnel
- ✅ Your existing Glitch project (if you have one)

The repo is **completely host-agnostic**. The `Dockerfile`, `server.js`, and all other files work on any modern Node.js host.
