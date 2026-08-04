// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import commands from '../../../src/commands/index.js';

describe('command registry', () => {
  it('has expected commands', () => {
    const expected = [
      'help', 'test', 'status', 'lint', 'describe', 'size', 'secrets',
      'deps', 'branch', 'commits', 'title', 'docs', 'tests',
      'approvals', 'assign', 'unassign', 'claim', 'unclaim',
      'thanks', 'metrics', 'review', 'label', 'unlabel',
      'good-first-issue', 'help-wanted', 'close', 'reopen',
      'lock', 'pin', 'weekly-digest', 'config',
      'merge', 'duplicate', 'wontfix', 'invalid', 'priority',
      'label-list', 'contributors', 'draft', 'ready',
      'cleanup-stale', 'note', 'rebuild',
    ];
    for (const name of expected) {
      expect(commands[name], `command '${name}' should exist`).toBeDefined();
      expect(commands[name].name).toBe(name);
      expect(typeof commands[name].execute).toBe('function');
      expect(typeof commands[name].requiresMaintainer).toBe('boolean');
    }
  });

  it('maintainer-only commands are flagged', () => {
    const maintainerOnly = ['assign', 'unassign', 'review', 'label', 'unlabel',
      'good-first-issue', 'help-wanted', 'close', 'reopen', 'lock', 'pin',
      'weekly-digest', 'config', 'merge', 'duplicate', 'wontfix', 'invalid',
      'priority', 'draft', 'ready', 'cleanup-stale', 'note', 'rebuild'];
    for (const name of maintainerOnly) {
      expect(commands[name].requiresMaintainer, `${name} should be maintainer-only`).toBe(true);
    }
  });

  it('public commands are not maintainer-only', () => {
    const publicCmds = ['help', 'test', 'status', 'lint', 'describe', 'size',
      'secrets', 'deps', 'branch', 'commits', 'title', 'docs', 'tests',
      'approvals', 'claim', 'unclaim', 'thanks', 'metrics', 'label-list',
      'contributors'];
    for (const name of publicCmds) {
      expect(commands[name].requiresMaintainer, `${name} should be public`).toBe(false);
    }
  });
});
