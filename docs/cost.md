# Cost breakdown — zero, for everyone

sipmap is free to use, free to install, free to host. This is enforced in CI.

## What costs nothing

| Component | Cost |
|---|---|
| License | MIT — free for any use |
| Source code | Free (public on GitHub) |
| Runtime dependencies (Probot, Octokit, js-yaml, pino) | Free, MIT |
| Test dependencies (Vitest, nock, fast-check, supertest) | Free, MIT |
| Glitch hosting | Free tier (with caveat) |
| Render / Fly.io / Railway free tier | Free |
| Self-host on your own machine | Free (uses your electricity, which is fine) |
| GitHub App manifest flow | Free — no Marketplace fee |
| GitHub REST/GraphQL API | Free within 5,000 req/hr (sipmap is light) |

## No paid services, ever

`scripts/verify-free.sh` (runs in CI) greps the codebase for:

- ❌ Sentry, Datadog, LogRocket, Mixpanel, Segment, FullStory, Hotjar, Intercom, Amplitude, Bugsnag, Rollbar, New Relic, Honeybadger
- ❌ Outbound fetch/axios/got calls to non-GitHub URLs
- ❌ `marketplace` references in `app.yml`
- ❌ Any non-MIT package in `package.json`

If any are found, CI fails and the PR can't merge.

## Glitch caveat (honest disclosure)

Glitch's free tier **sleeps the app after 5 minutes of inactivity**. This means a webhook arriving during sleep can take 30+ seconds to wake up and be processed.

**Mitigations (both free):**

1. **UptimeRobot** (free) pings the Glitch URL every 5 min → app stays awake. Set up a monitor on `https://<your-glitch-app>.glitch.me/`.
2. **Fly.io free tier** — no sleep, also free. See [`self-host.md`](./self-host.md).

## Cost verification commands

```bash
npm run verify:free          # confirms no paid deps or telemetry
npm run verify:no-actions    # confirms zero Actions consumption
npm run verify:all           # both
```

These run on every PR in CI.

## Can I use sipmap in a commercial product?

Yes — MIT allows commercial use, modification, and redistribution. You can even fork and sell a hosted version (just keep the copyright notice).
