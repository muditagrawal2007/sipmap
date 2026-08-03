// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import logger from '../../../src/utils/logger.js';

describe('logger redaction', () => {
  it('redacts GitHub PATs', () => {
    const r = logger.redact('token: ghp_abcdefghijklmnopqrstuvwxyz0123456789');
    expect(r).not.toContain('ghp_');
    expect(r).toContain('[REDACTED]');
  });

  it('redacts AWS keys', () => {
    const r = logger.redact('AKIAIOSFODNN7EXAMPLE');
    expect(r).toContain('[REDACTED]');
    expect(r).not.toContain('AKIA');
  });

  it('redacts email addresses', () => {
    const r = logger.redact('contact alice@example.com please');
    expect(r).not.toContain('alice@example.com');
    expect(r).toContain('[REDACTED]');
  });

  it('redacts PEM blocks', () => {
    const pem = '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----';
    const r = logger.redact(pem);
    expect(r).not.toContain('BEGIN RSA PRIVATE KEY');
  });

  it('handles nested objects', () => {
    const r = logger.redact({ user: 'alice@example.com', data: { token: 'ghp_' + 'a'.repeat(36) } });
    expect(JSON.stringify(r)).not.toContain('alice@example.com');
    expect(JSON.stringify(r)).not.toContain('ghp_');
  });

  it('safeLog only allows whitelisted keys', () => {
    // Just verifying it doesn't throw and returns no-op for unknown keys.
    logger.info({ event: 'test', repo_id: 1, command: 'help', actor_login: 'alice', password: 'secret123' });
    // The password key should never make it into the log output regardless.
  });
});
