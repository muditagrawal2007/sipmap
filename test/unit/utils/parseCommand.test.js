// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { parseCommand, isCommand, TRIGGER } from '../../../src/utils/parseCommand.js';

describe('parseCommand', () => {
  it('parses a basic command with no args', () => {
    const r = parseCommand('hello\n:sipmap /help\nbye');
    expect(r).not.toBeNull();
    expect(r.name).toBe('help');
    expect(r.args).toEqual([]);
  });

  it('parses a command with multiple args', () => {
    const r = parseCommand(':sipmap /assign @alice reviewer');
    expect(r.name).toBe('assign');
    expect(r.args).toEqual(['@alice', 'reviewer']);
  });

  it('handles leading whitespace and case', () => {
    const r = parseCommand('   :sipmap /HELP');
    expect(r.name).toBe('help');
  });

  it('handles CRLF line endings', () => {
    const r = parseCommand(':sipmap /test\r\nother');
    expect(r.name).toBe('test');
  });

  it('returns null when no trigger present', () => {
    expect(parseCommand('just a regular comment')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(parseCommand('')).toBeNull();
    expect(parseCommand(null)).toBeNull();
    expect(parseCommand(undefined)).toBeNull();
  });

  it('handles quoted args', () => {
    const r = parseCommand(':sipmap /label "needs review" "in progress"');
    expect(r.args).toEqual(['needs review', 'in progress']);
  });

  it('handles single-quoted args', () => {
    const r = parseCommand(":sipmap /label 'needs review'");
    expect(r.args).toEqual(['needs review']);
  });

  it('ignores second command on second line (returns first)', () => {
    const r = parseCommand(':sipmap /help\n:sipmap /test');
    expect(r.name).toBe('help');
  });

  it('does not match partial trigger', () => {
    expect(parseCommand(':sipmapper /help')).toBeNull();
  });

  it('TRIGGER constant equals :sipmap', () => {
    expect(TRIGGER).toBe(':sipmap');
  });

  it('isCommand helper', () => {
    expect(isCommand(':sipmap /help', 'help')).toBe(true);
    expect(isCommand(':sipmap /test', 'help')).toBe(false);
  });
});
