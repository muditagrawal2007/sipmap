# GO LIVE — make `https://github.com/apps/sipmap` work

This is a single, linear guide. Do each step in order. Don't skip ahead.

---

## STEP 0 — Open a terminal

Open Terminal.app on your Mac. You'll type commands here.

All later steps assume you're in the sipmap folder. Run this once:

```bash
cd /Users/muditagrawal/Documents/Developer/sipmap
```

---

## STEP 1 — Install the Fly.io command-line tool (one-time)

Copy-paste this into your terminal:

```bash
brew install flyctl
```

Wait for it to finish. Then verify:

```bash
fly version
```

You should see something like `fly v0.4.77 ...`.

---

## STEP 2 — Create a Fly.io account (one-time)

```bash
fly auth signup
```

A browser tab opens. Sign up with email + password. Free tier; credit card required but **not charged** unless you exceed free limits.

After signup, come back to your terminal. Verify:

```bash
fly auth whoami
```

It should print your email.

---

## STEP 3 — Register the GitHub App (one-time, in browser)

Open this URL **in your browser** (logged in as `muditagrawal2007`):

```
https://github.com/settings/apps/new?manifest=https://raw.githubusercontent.com/muditagrawal2007/sipmap/main/app.yml
```

You'll see a form pre-filled with everything. Just:

1. **Webhook URL**: leave the placeholder as-is for now (we'll fix it in step 6)
2. Click the green **Create** button

You're taken to the App settings page.

**Now do these 4 things in order on that page:**

### 3a — Copy the App ID

The App ID is a number near the top of the **General** tab.

Example: `123456`

**Save it somewhere** (you'll paste it soon).

### 3b — Set the Webhook Secret

Scroll down on the **General** tab to find **Webhook secret**.

Click into the field and paste this:

```
sipmap-shared-secret-change-me-in-production
```

(Or make up your own random string. We'll use this exact string in step 5.)

### 3c — Download the private key

Still on the **General** tab, scroll to **Private keys**.

Click **Generate a private key**.

A file downloads — it's named something like `muditagrawal2007-sipmap.2026-08-03.private-key.pem`.

**Move it into the sipmap folder and remember the path**, e.g.:

```bash
mv ~/Downloads/muditagrawal2007-sipmap.*.pem /Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem
```

### 3d — Make the App public

In the left sidebar, click **Public page**.

Make sure it's set to **Public** (a toggle). If it says "Make public", click it.

---

## STEP 4 — Deploy to Fly.io (one command)

Go back to your terminal. You're still in the sipmap folder. Run:

```bash
scripts/deploy-fly.sh
```

The script will ask you for:

1. **App name** — press Enter to accept the default `sipmap`
2. **Region** — type one close to you, e.g. `sin` (Singapore), `iad` (US East), `fra` (Frankfurt), `syd` (Sydney)
3. **APP_ID** — paste the number from step 3a
4. **Path to .pem private key file** — paste: `/Users/muditagrawal/Documents/Developer/sipmap/app-private-key.pem`
5. **WEBHOOK_SECRET** — paste: `sipmap-shared-secret-change-me-in-production` (the same string from step 3b)

The script then automatically:
- Creates the app on Fly.io
- Sets the 3 secrets
- Deploys the Docker image
- Waits for it to come online

**Wait ~3-5 minutes.** It prints progress.

When it's done, you'll see something like:

```
🎉 Deploy complete!

Your webhook URL is: https://sipmap.fly.dev/
```

**Copy that URL.** You'll need it in step 5.

---

## STEP 5 — Tell GitHub where the bot is running

In your browser, go to:

```
https://github.com/settings/apps
```

Click your `sipmap` App → left sidebar → **Webhook**.

Update two fields:

1. **Webhook URL**: paste your Fly URL (e.g. `https://sipmap.fly.dev/`)
2. **Webhook secret**: paste `sipmap-shared-secret-change-me-in-production` (same string from step 3b)

Click **Save changes**.

GitHub immediately sends a `ping` event to verify. After ~5 seconds, look at the **Recent deliveries** section — you should see a green checkmark indicating success.

---

## STEP 6 — Install the App in a test repo

Visit:

```
https://github.com/apps/sipmap
```

(The page should now resolve — no more 404!)

Click **Install** → pick a repo where you have admin rights.

---

## STEP 7 — Test it works

Open any issue or PR in that repo. Comment:

```
:sipmap /help
```

Within ~10 seconds, the bot replies with a list of all commands. 🎉

---

## ✅ DONE

Your bot is live at `https://sipmap.fly.dev/` and installable from `https://github.com/apps/sipmap`.

Share that install URL anywhere — anyone can install it.

---

## What if something goes wrong?

### Step 4 — `fly auth signup` opens browser but nothing happens

The browser OAuth may have failed. Try `fly auth login` instead (uses GitHub OAuth, faster).

### Step 4 — "App name already taken"

The name `sipmap` on Fly.io is taken. Type a different name when prompted (e.g. `sipmap-bot`). Your webhook URL becomes `https://sipmap-bot.fly.dev/`.

### Step 4 — "Image build failed"

Run `fly logs --app sipmap` to see the error. Most common cause: missing PEM file path. Verify the file exists at the path you gave.

### Step 5 — Webhook ping shows red X

Run `fly logs --app sipmap` on your terminal. Look for the request. Most common causes:
- Wrong webhook URL (typo)
- Wrong webhook secret (must match what's in your Fly secrets AND the GitHub App settings)
- App still starting up (wait 30 seconds, then click "Redeliver" on the failed event)

### Step 7 — Bot doesn't reply

Run `fly logs --app sipmap` and look for errors. Common causes:
- Bot received the event but failed to fetch `.sipmap.yml` (default behavior — fine, should still work)
- Permission error from GitHub (check your App's permissions in step 3)

### I want to start over

Run:

```bash
fly destroy --app sipmap
```

Then delete the App at https://github.com/settings/apps → click your App → bottom of General tab → **Delete app**.

Then start again from step 1.

---

## Total time: ~10 minutes

| Step | Time |
|---|---|
| 1. Install flyctl | 1 min |
| 2. Fly.io signup | 2 min |
| 3. Register GitHub App | 3 min |
| 4. Deploy to Fly.io | 3 min |
| 5. Wire webhook URL | 1 min |
| 6. Install the App | 30 sec |
| 7. Test | 30 sec |

## Total cost: **$0**

(Fly.io free tier: 3 shared VMs, 256 MB RAM each, no sleep.)
