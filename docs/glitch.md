# Glitch one-click deploy

Glitch is the easiest free hosting for sipmap. This guide walks you through deploying a private copy of the bot in under 2 minutes.

## Caveat: Glitch free tier sleeps

Glitch's free tier puts apps to sleep after 5 minutes of inactivity. The first webhook after sleep takes ~30s to wake up. **To avoid this, set up UptimeRobot (free) to ping the app every 5 min.**

## Steps

1. **Remix on Glitch**
   - Visit the public remix URL: `https://glitch.com/edit/#!remix/<YOUR-SIPMAP-GLITCH-PROJECT>`
   - (This URL is published by the project owner; fork the source repo and update it if you fork)
   - Click **Remix to Edit** → Glitch creates your own copy

2. **Add environment variables**
   - In the Glitch editor, click `.env` (in the left sidebar)
   - Fill in:
     ```
     APP_ID=<your GitHub App numeric ID>
     WEBHOOK_SECRET=<a random string>
     PRIVATE_KEY="<paste your .pem contents here, with \n replaced by actual newlines>"
     ```
   - Save (Glitch auto-reboots)

3. **Get your webhook URL**
   - Click **Share** → copy the live URL (e.g. `https://my-sipmap.glitch.me`)

4. **Update your GitHub App**
   - GitHub → Settings → Developer settings → GitHub Apps → your app
   - Set **Webhook URL** to `https://my-sipmap.glitch.me/`
   - Set **Webhook secret** to the same `WEBHOOK_SECRET` from step 2

5. **Keep it awake**
   - Go to https://uptimerobot.com (free)
   - Add a new monitor: HTTP(s), URL = `https://my-sipmap.glitch.me/`, interval = 5 min
   - Now webhooks are always instant

6. **Test**
   - Open an issue in any repo where the App is installed
   - Comment `:sipmap /help`
   - sipmap should reply within ~10s

## Cost

- Glitch free tier: **$0**
- UptimeRobot free tier: **$0**
- Total: **$0**

## Limitations

- 1024 MB RAM limit on Glitch
- Sleeps after 5 min idle (mitigated by UptimeRobot)
- Public project by default; make it private in Project Settings if you don't want others to see the code
