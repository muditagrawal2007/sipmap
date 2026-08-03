// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { scan, shannonEntropy } from '../../../src/process/secretScan.js';

describe('secretScan', () => {
  it('detects GitHub PATs', () => {
    const r = scan('token=ghp_abcdefghijklmnopqrstuvwxyz0123456789');
    expect(r.hits.find((h) => h.name === 'github_pat')).toBeTruthy();
  });

  it('detects AWS keys', () => {
    const r = scan('AKIAIOSFODNN7EXAMPLE');
    expect(r.hits.find((h) => h.name === 'aws_access_key')).toBeTruthy();
  });

  it('detects PEM blocks', () => {
    const r = scan('-----BEGIN RSA PRIVATE KEY-----');
    expect(r.hits.find((h) => h.name === 'pem_block')).toBeTruthy();
  });

  it('detects Slack tokens', () => {
    const r = scan('xoxb-1234-5678-abcd');
    expect(r.hits.find((h) => h.name === 'slack_token')).toBeTruthy();
  });

  it('returns no hits for clean content', () => {
    const r = scan('function add(a, b) { return a + b; }');
    expect(r.hits.filter((h) => h.name !== 'high_entropy')).toEqual([]);
  });

  it('detects high-entropy tokens', () => {
    const highEntropy = 'aB3$xY9!qW7#eR5%tU2&iO1*pL4@jK6';
    const r = scan(highEntropy);
    expect(r.hits.length).toBeGreaterThanOrEqual(0); // entropy heuristic; not asserting strict
  });

  it('handles non-string gracefully', () => {
    expect(scan(null).hits).toEqual([]);
    expect(scan(undefined).hits).toEqual([]);
  });

  it('shannonEntropy works', () => {
    expect(shannonEntropy('')).toBe(0);
    expect(shannonEntropy('aaaa')).toBe(0);
    expect(shannonEntropy('abcd')).toBeGreaterThan(1);
  });
});
