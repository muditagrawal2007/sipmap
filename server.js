// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Production HTTP server entry point.
// Used by Glitch, Render, Fly.io, Docker, and any host that runs `npm start`.

const { createServer } = require('node:http');
const { Probot, createNodeMiddleware, ProbotOctokit } = require('probot');
const appFn = require('./src/index');

const appId = Number(process.env.APP_ID);
const privateKey = (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n');
const secret = process.env.WEBHOOK_SECRET || 'development';

if (!appId || !privateKey) {
  console.error('❌ Missing required env vars: APP_ID and PRIVATE_KEY');
  console.error('   See .env.example and docs/self-host.md for setup.');
  process.exit(1);
}

const probot = new Probot({
  appId,
  privateKey,
  secret,
  // Disable throttling/retry in dev for snappier local testing; enable in prod.
  ...(process.env.NODE_ENV === 'production' ? {} : {
    Octokit: ProbotOctokit.defaults({ retry: { enabled: false }, throttle: { enabled: false } }),
  }),
});

const middleware = createNodeMiddleware(appFn, { probot, webhooksPath: '/' });

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const server = createServer((req, res) => {
  middleware(req, res, () => {
    // Health-check / generic 200 for non-webhook traffic.
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('sipmap is running.\n');
  });
});

server.listen(port, host, () => {
  console.log(`🤖 sipmap listening on http://${host}:${port}`);
  console.log(`   Webhook URL: http://${host}:${port}/`);
});
