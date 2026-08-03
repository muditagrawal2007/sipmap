# Self-hosting sipmap

sipmap runs anywhere Node.js 18+ runs. This guide covers the **recommended hosts** in order of preference.

> **Heads up:** [Glitch is no longer a viable host](https://blog.glitch.com) for new apps. Use **Render** (easiest, no credit card), **Fly.io** (no sleep, requires credit card), or run locally.

## Quick path: see [`docs/GO-LIVE.md`](./GO-LIVE.md)

The single linear guide to make `https://github.com/apps/sipmap` work, with Render as the primary host.

---

## Option 1 — Render (easiest, free, no credit card)

Render is the **easiest** deploy path:
- No CLI needed
- **No credit card required** for free tier signup
- GitHub-integrated: connects to your repo, builds on every push
- One-click blueprint via `render.yaml` (already in this repo)

**Free tier:** 750 hours/month, sleeps after 15 min idle.

### One-click via Blueprint (3 min)

The repo includes a `render.yaml` blueprint. To use it:

1. Sign up at https://render.com/register (free, no credit card)
2. Visit https://dashboard.render.com/blueprints
3. Click **New Blueprint Instance** → select `muditagrawal2007/sipmap`
4. Click **Apply** — Render creates the service
5. Set the 3 env vars in the dashboard (APP_ID, WEBHOOK_SECRET, PRIVATE_KEY)
6. Render builds + deploys automatically (~2 min)

Full walkthrough: [`docs/GO-LIVE.md`](./GO-LIVE.md).

### Manual setup (no blueprint)

1. https://render.com → **New +** → **Web Service**
2. Connect `muditagrawal2007/sipmap` repo
3. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm ci --omit=dev --no-audit --no-fund`
   - **Start Command**: `node server.js`
   - **Plan**: Free
4. Add the 3 env vars (APP_ID, WEBHOOK_SECRET, PRIVATE_KEY — see below)
5. Click **Create Web Service**

Render builds and deploys. Your URL is `https://<service-name>.onrender.com/`.

### Render operations cheatsheet

```bash
# Render has no CLI but everything is in the web dashboard:
# https://dashboard.render.com/web/<service-id>
# - Logs (live tail)
# - Events (deploy history)
# - Environment (edit env vars, redeploys on save)
# - Shell (open a one-off shell into the running container)
```

### Cost details

| Item | Free tier |
|---|---|
| Web service hours | 750 hrs/month (always-on for one service) |
| RAM | 512 MB |
| Sleep after idle | 15 minutes |
| HTTPS | Auto (Let's Encrypt) |
| Custom domain | Free |

---

## Option 2 — Fly.io (no sleep, free, requires credit card)

Fly.io is the best option if you want **no sleep**. Same sipmap, no idle delay. **Cost: $0** within free tier, but Fly requires a credit card on signup.

Fly.io gives sipmap a free VM with 256 MB RAM and no sleep on idle. **Cost: $0** within free tier.

### One-command deploy

The repo includes [`scripts/deploy-fly.sh`](../scripts/deploy-fly.sh) that handles everything end-to-end:

```bash
# 1. Install flyctl (once)
brew install flyctl

# 2. Sign up to Fly.io (once, browser OAuth)
fly auth signup

# 3. Register the GitHub App first to get your APP_ID and .pem key:
#    https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml

# 4. Deploy sipmap
scripts/deploy-fly.sh
```

The script will:
- Pick an app name (default `sipmap`)
- Choose a region (default `sin` — change to one near your users)
- Prompt for `APP_ID` and the path to your `.pem` private key
- Auto-generate a `WEBHOOK_SECRET` (or accept your own)
- Run `fly launch` + `fly secrets set` + `fly deploy`
- Print your webhook URL: `https://sipmap.fly.dev/`

After it finishes, paste that URL into your GitHub App's **Webhook URL** field.

### Manual Fly.io steps (if you don't want the script)

```bash
# 1. Install
brew install flyctl

# 2. Auth
fly auth signup   # or: fly auth login

# 3. Launch
cd /path/to/sipmap
fly launch --no-deploy \
  --name sipmap \
  --region sin \
  --internal-port 3000 \
  --auto-stop-machines false

# 4. Set secrets (PEM must have \n escaped)
fly secrets set \
  APP_ID=123456 \
  WEBHOOK_SECRET=$(openssl rand -hex 32) \
  PRIVATE_KEY="$(cat /path/to/app.pem | sed ':a;N;$!ba;s/\n/\\n/g')"

# 5. Deploy
fly deploy

# 6. Verify
curl https://sipmap.fly.dev/
# Expected: sipmap is running.
```

### Fly.io operations cheatsheet

```bash
fly logs --app sipmap              # live logs (tail -f style)
fly status --app sipmap            # check health
fly open --app sipmap              # open in browser
fly ssh console --app sipmap       # SSH into the container
fly secrets list --app sipmap      # list secrets (values redacted)
fly secrets unset KEY --app sipmap # delete a secret
fly deploy --app sipmap            # redeploy after code changes
fly destroy --app sipmap           # tear it down
```

### Fly.io cost details

| Item | Free tier | Cost |
|---|---|---|
| Shared VMs | 3 included | $0 |
| RAM per VM | 256 MB | $0 |
| Outbound data | 100 GB/mo | $0 |
| HTTPS cert | Auto (Let's Encrypt) | $0 |
| Custom domain | Free subdomains (`*.fly.dev`) | $0 |
| **Total** | — | **$0** |

You do need a **credit card on file** to sign up (Fly uses this for abuse prevention). You won't be charged within free tier limits.

---

## Option 2 — Render (easiest GitHub integration)

Render is simpler than Fly.io for a GitHub-linked deploy — no CLI needed.

1. Push your fork to GitHub (already done if you're reading this).
2. Go to https://render.com → **New +** → **Web Service** → connect your GitHub repo.
3. Configure:
   - **Environment**: `Node`
   - **Build Command**: `npm ci`
   - **Start Command**: `node server.js`
   - **Plan**: Free
4. Add environment variables (in the **Environment** tab):
   ```
   APP_ID=<your App ID>
   WEBHOOK_SECRET=<your webhook secret>
   PRIVATE_KEY=<paste .pem contents with \n escapes>
   ```
5. Click **Create Web Service**.

Render auto-builds and deploys. Your URL will be `https://<service-name>.onrender.com/`.

**Caveat:** Render's free tier **sleeps after 15 minutes of inactivity**. First webhook after sleep takes ~30s. Free workarounds:
- UptimeRobot monitor every 5 min (free)
- Upgrade to Render's $7/mo plan (no sleep)

---

## Option 3 — Local + Cloudflare Tunnel (free, no third-party host)

If you want to run the bot on your own machine and expose it via a free HTTPS tunnel:

```bash
# Terminal 1: run the bot
npm install
cp .env.example .env  # fill in APP_ID, WEBHOOK_SECRET, PRIVATE_KEY
npm start

# Terminal 2: expose via Cloudflare Tunnel (no account needed)
brew install cloudflared
cloudflared tunnel --url http://localhost:3000
```

`cloudflared` prints a public HTTPS URL like `https://<random>.trycloudflare.com/`. Paste it as your App's webhook URL.

**Pros:** free, instant, no third-party host
**Cons:** bot only runs while your Mac is on; URL changes each restart (unless you have a domain)

For a stable URL with your own domain:

```bash
cloudflared tunnel login
cloudflared tunnel create sipmap
cloudflared tunnel route dns sipmap sipmap.yourdomain.com
cloudflared tunnel run sipmap
```

Then `https://sipmap.yourdomain.com/` is your stable webhook URL.

---

## Option 4 — Docker (local or any Docker host)

```bash
docker build -t sipmap .
docker run -p 3000:3000 \
  -e APP_ID=123456 \
  -e WEBHOOK_SECRET=... \
  -e PRIVATE_KEY="$(cat app.pem | sed ':a;N;$!ba;s/\n/\\n/g')" \
  sipmap
```

For production on any Docker host (DigitalOcean, AWS ECS, your own server), the same image works. Expose port 3000 behind a reverse proxy (Caddy, nginx, Traefik) for TLS termination.

---

## What's needed in `.env`

For all hosts above:

```bash
APP_ID=<numeric App ID from your GitHub App settings>
WEBHOOK_SECRET=<random string, e.g. $(openssl rand -hex 32)>
PRIVATE_KEY="<your .pem contents, \n-escaped if single-line>"
PORT=3000                      # most hosts set this automatically
```

The `PRIVATE_KEY` env var must contain literal `\n` (not actual newlines) when stored as a single-line env var (which is what most cloud hosts use). On your local machine you can use a multi-line env var directly.

---

## Health check

Whatever host you pick, expose `GET /` and have it return 200. GitHub uses this for webhook delivery verification. sipmap's `server.js` does this automatically — visiting `/` returns:

```
sipmap is running.
```

---

## Production checklist

- [ ] `APP_ID`, `WEBHOOK_SECRET`, `PRIVATE_KEY` set as env vars (never in code)
- [ ] HTTPS endpoint reachable
- [ ] Webhook secret is randomly generated (`openssl rand -hex 32`)
- [ ] `.sipmap.yml` customization docs linked from your fork's README
- [ ] `npm run verify:all` passes before each deploy
