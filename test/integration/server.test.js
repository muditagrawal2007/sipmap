// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

describe('server.js', () => {
  it('boots and serves a 200 on /', async () => {
    // Spawn `node server.js` with required env.
    const proc = spawn('node', ['server.js'], {
      env: {
        ...process.env,
        APP_ID: '12345',
        PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA\n-----END RSA PRIVATE KEY-----',
        WEBHOOK_SECRET: 'test',
        PORT: '3737',
        NODE_ENV: 'test',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    proc.stdout.on('data', (d) => { out += d.toString(); });
    proc.stderr.on('data', (d) => { out += d.toString(); });
    void out; // captured for potential future debugging; not asserted here

    // Wait briefly for startup.
    await wait(1500);

    try {
      const res = await fetch('http://127.0.0.1:3737/');
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).toContain('sipmap is running');
    } finally {
      proc.kill('SIGTERM');
    }
  }, 10000);
});
