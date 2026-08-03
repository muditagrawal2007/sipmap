# GO LIVE — make `https://github.com/apps/sipmap` work

This is a single, linear guide. Do each step in order. Don't skip ahead.

> **Using Render (recommended — no credit card needed).**
> Fly.io is documented in [`docs/self-host.md`](./self-host.md) but requires a credit card on signup.

---

## STEP 0 — Open a terminal

Open Terminal.app on your Mac. You'll type commands here.

```bash
cd /Users/muditagrawal/Documents/Developer/sipmap
```

---

## STEP 1 — Sign up to Render (one-time, browser)

Open in your browser:

```
https://render.com/register
```

- Click **Sign up with GitHub**
- Authorize Render to access your repos (you can scope it to just `sipmap` later)
- **No credit card needed** for the free tier

You'll land on the Render dashboard.

---

## STEP 2 — Register the GitHub App (one-time, browser)

Open this URL **in your browser** (logged in as `muditagrawal2007`):

```
https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml
```

You'll see a form pre-filled with everything. Just:

1. **Webhook URL**: paste this EXACT value (Render will host your bot here):
   ```
   https://sipmap.onrender.com/
   ```
   (Don't worry — even if Render gives you a different name, you can fix this later.)
2. Click the green **Create** button

You're taken to the App settings page. **Do these 3 things:**

### 2a — Copy the App ID

The App ID is a number near the top of the **General** tab. Example: `123456`. **Save it.**

### 2b — Set the Webhook Secret

Scroll down to **Webhook secret**. Paste this exact string:

```
sipmap-shared-secret-2026
```

(You can change it later if you want — but use this exact string for now, and we'll use the same in Render.)

### 2c — Download the private key

Still on the **General** tab, scroll to **Private keys**.

Click **Generate a private key**.

A `.pem` file downloads. Move it into the sipmap folder:

```bash
mv ~/Downloads/muditagrawal2007-sipmap.*.pem /Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem
```

### 2d — Make the App public

Left sidebar → **Public page**. Make sure the App is **Public**.

---

## STEP 3 — Create the Render service from blueprint

Open in your browser:

```
https://dashboard.render.com/blueprints
```

Click **New Blueprint Instance**.

- **Connect your GitHub account** if you haven't (top-right → Account Settings → Connections)
- **Repository**: select `muditagrawal2007/sipmap`
- Render auto-detects the `render.yaml` file and shows the service config
- Click **Apply**
- Render starts building (takes ~2 min)

You'll see a new service called **sipmap** in your dashboard. Build takes ~2 minutes.

---

## STEP 4 — Set the 3 environment variables

In your Render dashboard, click the **sipmap** service → **Environment** (left sidebar).

Click **Add Environment Variable** for each of these three:

### Variable 1: `APP_ID`

- **Key**: `APP_ID`
- **Value**: paste the number from step 2a (e.g. `123456`)

### Variable 2: `WEBHOOK_SECRET`

- **Key**: `WEBHOOK_SECRET`
- **Value**: `sipmap-shared-secret-2026` (the SAME string from step 2b)

### Variable 3: `PRIVATE_KEY`

- **Key**: `PRIVATE_KEY`
- **Value**: paste your PEM contents with newlines escaped as `\n`. Easiest way — run this in your terminal:

  ```bash
  PRIVATE_KEY_VAL=$(cat /Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem | sed ':a;N;$!ba;s/\n/\\n/g')
  echo "$PRIVATE_KEY_VAL"
  ```

  Copy the entire output (including `-----BEGIN` and `-----END` markers with `\n` between lines).

  Paste it into the Render Value field.

Click **Save Changes**. Render redeploys automatically (~2 min).

---

## STEP 5 — Verify the bot is alive

Wait for the deploy to finish (~2 min). Then click the URL at the top of the Render dashboard — it looks like:

```
https://sipmap.onrender.com/
```

You should see:

```
sipmap is running.
```

✅ The bot is live.

---

## STEP 6 — Update the webhook URL back to Render

If your Render URL turned out different from `sipmap.onrender.com/`, fix it in GitHub:

1. https://github.com/settings/apps → click `sipmap`
2. Left sidebar → **Webhook** → **Webhook URL**
3. Paste your actual Render URL (e.g. `https://sipmap.onrender.com/`)
4. Save

GitHub sends a `ping` event. Check Render logs (Events tab) for a 200 response.

---

## STEP 7 — Install the App

Visit:

```
https://github.com/apps/sipmap
```

(The page now resolves!)

Click **Install** → pick a test repo.

---

## STEP 8 — Test

Open any issue or PR in that repo. Comment:

```
:sipmap /help
```

Within ~10 seconds, the bot replies. 🎉

---

## ✅ DONE

Your bot is live and installable.

| Item | Value |
|---|---|
| Bot URL | `https://sipmap.onrender.com/` |
| Install page | `https://github.com/apps/sipmap` |
| Cost | **$0** |

---

## What if something goes wrong?

### "Build failed" in Render

Click the failed build → see the log. Common causes:
- `npm ci` failed → check your `package.json` is valid
- `node server.js` failed → check your env vars are set correctly

### Bot responds with 500 errors

Click **Logs** in Render. Look for stack traces. Most common cause: `PRIVATE_KEY` has actual newlines instead of `\n` escapes. Re-do step 4, variable 3.

### First webhook after 15 min takes ~30 seconds

Render's free tier sleeps after 15 min idle. Either:
- Use UptimeRobot (free) to ping the URL every 5 min
- Or upgrade to Render's $7/mo plan (no sleep)

### "I want to start over"

1. https://dashboard.render.com → click **sipmap** → Settings → Delete Web Service
2. https://github.com/settings/apps → click your App → bottom of General → Delete app

Then start over from step 1.

---

## Total time: ~10 minutes

| Step | Time |
|---|---|
| 1. Render signup | 1 min |
| 2. Register GitHub App | 3 min |
| 3. Create Render service | 2 min |
| 4. Set env vars | 2 min |
| 5. Verify alive | 30 sec |
| 6. Update webhook URL | 30 sec |
| 7. Install App | 30 sec |
| 8. Test | 30 sec |

## Total cost: **$0**

(Render free tier: 750 hours/mo, sleeps after 15 min idle.)
