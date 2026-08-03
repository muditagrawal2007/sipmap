# Glitch one-click deploy

Glitch is the easiest free hosting for sipmap. **Cost: $0** (free tier + free UptimeRobot keep-alive).

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
2. **A Glitch account.** Sign up at https://glitch.com (free).

## Steps

### 1. Remix on Glitch

Click: **`https://glitch.com/edit/#!remix/sipmap-glitch-starter`**

*(You — the owner — need to publish this starter project once on Glitch. Until then, use the "Import from GitHub" option: visit https://glitch.com/edit/#!/import/github/muditagrawal2007/sipmap — Glitch will create a new project from the GitHub repo.)*

Glitch will create your own copy and start installing deps automatically. Takes ~1 minute.

### 2. Add your secrets

In the Glitch editor's left sidebar, click **`.env`**. Fill in:

```bash
APP_ID=<your App numeric ID, e.g. 123456>
WEBHOOK_SECRET=<any random string, e.g. $(openssl rand -hex 32)>
PRIVATE_KEY="<paste your .pem file contents here. Keep the quotes and replace literal newlines with \n>"
PORT=3000
```

Click **Save** — Glitch auto-reboots your app.

### 3. Get your webhook URL

Click **Share** (top-right in Glitch) → **Live App**. Copy the URL, e.g.:

```
https://my-sipmap.glitch.me
```

Test it: visit the URL in your browser. You should see:

```
sipmap is running.
```

### 4. Update your GitHub App

Visit https://github.com/settings/apps → click your App → **Webhook** section:

- **Webhook URL**: `https://my-sipmap.glitch.me/`
- **Webhook secret**: paste the same `WEBHOOK_SECRET` you used in step 2
- Enable **SSL verification** ✓

Save. GitHub will send a `ping` event to verify — your Glitch logs should show a 200 response.

### 5. Keep it awake (free)

Glitch's free tier sleeps apps after 5 minutes of inactivity, causing ~30s delay on the first webhook after sleep. To prevent this, use **UptimeRobot** (free):

1. Sign up at https://uptimerobot.com (free)
2. Click **+ Add New Monitor**
3. **Monitor Type**: HTTP(s)
4. **Friendly Name**: `sipmap keep-alive`
5. **URL**: `https://my-sipmap.glitch.me/`
6. **Monitoring Interval**: 5 minutes
7. Save

Now webhooks are always instant.

### 6. Smoke test

Open any issue or PR in a repo where the App is installed and comment:

```
:sipmap /help
```

Within ~10 seconds, the bot replies with the full command list. 🎉

## Cost summary

| Item | Cost |
|---|---|
| Glitch hosting (free tier) | $0 |
| UptimeRobot free tier | $0 |
| Domain (not required) | $0 |
| **Total** | **$0** |

## Caveats

- **Public by default.** Glitch makes new projects visible. Make your project private: Project Settings → "This project is private" → toggle on.
- **1024 MB RAM limit.** Plenty for sipmap (uses ~80 MB).
- **Sleeps after 5 min idle** without UptimeRobot.
- **Custom domain** possible but optional (Glitch free tier supports `glitch.me` subdomains for free).

## Troubleshooting

### Bot doesn't respond to commands

1. Check Glitch logs — any errors?
2. Confirm the webhook URL in your GitHub App matches your live Glitch URL exactly (including trailing `/`).
3. Confirm `WEBHOOK_SECRET` matches between `.env` and GitHub App settings.
4. Look at the GitHub App's **Advanced → Recent deliveries** — failed deliveries show error details.

### "Invalid PEM" error on startup

The `PRIVATE_KEY` env var must contain literal `\n` (not actual newlines) when set in Glitch's `.env` file. Glitch's `.env` is a UI form — paste with `\n` literal:

```
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQ...\n-----END RSA PRIVATE KEY-----"
```

### Slow first response after sleep

Set up UptimeRobot per step 5 above.

## Alternative: Fly.io (no sleep, also free)

If you don't want the sleep caveat, see [`docs/self-host.md`](./self-host.md) for Fly.io or Render deployment.
