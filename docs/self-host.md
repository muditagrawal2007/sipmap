# Self-hosting sipmap

Three free hosting options. Pick whichever you prefer.

## Option 1 — Local development (machine)

Good for development and testing.

```bash
git clone https://github.com/muditagrawal2007/sipmap.git
cd sipmap
npm install
cp .env.example .env
# Fill in .env with your GitHub App credentials
npm start
```

For webhook proxying from GitHub to your local machine, use [smee.io](https://smee.io):

1. Visit https://smee.io and click **Start a new channel**
2. Copy the URL into `.env` as `SMEE_URL`
3. In your GitHub App settings, set the webhook URL to the smee URL
4. `npm start` will proxy events to your local server

## Option 2 — Glitch

See [`glitch.md`](./glitch.md).

## Option 3 — Fly.io (no sleep, recommended for production)

```bash
# Install flyctl: https://fly.io/docs/getting-started/installing-flyctl/
fly launch --no-deploy
# Set secrets:
fly secrets set APP_ID=12345 \
  WEBHOOK_SECRET=$(openssl rand -hex 32) \
  PRIVATE_KEY="$(cat private-key.pem)"
fly deploy
```

The included `Dockerfile` builds a minimal image.

## Option 4 — Render

1. Push your fork to GitHub
2. Render → New → Web Service → pick your repo
3. Build command: `npm ci`
4. Start command: `npm start`
5. Add the same env vars

## Dockerfile (copy into your fork)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY scripts ./scripts
COPY app.yml ./
EXPOSE 3000
CMD ["npm", "start"]
```

## Healthcheck

Whatever host you pick, expose `/` and have it return `200 OK`. GitHub will use this for webhook delivery.

## Production checklist

- [ ] `APP_ID`, `WEBHOOK_SECRET`, `PRIVATE_KEY` set as env vars (never in code)
- [ ] HTTPS endpoint reachable
- [ ] Webhook secret is randomly generated (`openssl rand -hex 32`)
- [ ] `.sipmap.yml` customization docs linked from your fork's README
- [ ] `npm run verify:all` passes before each deploy
