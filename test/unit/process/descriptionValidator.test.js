// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
import { describe, it, expect } from 'vitest';
import { evaluate, isPlaceholder } from '../../../src/process/descriptionValidator.js';

describe('descriptionValidator', () => {
  it('flags empty description', () => {
    const r = evaluate('', null, { minLength: 30 });
    expect(r.empty).toBe(true);
    expect(r.ok).toBe(false);
    expect(r.verdict).toBe('empty');
  });

  it('flags placeholder description', () => {
    expect(isPlaceholder('No description provided.')).toBe(true);
    expect(isPlaceholder('<!-- please fill -->')).toBe(true);
    expect(isPlaceholder('(empty)')).toBe(true);
  });

  it('passes good description with no template', () => {
    const r = evaluate('This PR adds the login feature with proper tests and docs.', null, { minLength: 30 });
    expect(r.ok).toBe(true);
    expect(r.verdict).toBe('good');
  });

  it('flags too-short description', () => {
    const r = evaluate('short', null, { minLength: 30 });
    expect(r.ok).toBe(false);
    expect(r.verdict).toBe('too-short');
  });

  it('detects required sections from markdown template', () => {
    const tpl = { path: 'x.md', content: '## What\n\n## How to test\n' };
    const body = '## What\nStuff\n## How to test\nTests here.';
    const r = evaluate(body, tpl, { minLength: 10 });
    expect(r.sections.length).toBe(2);
    expect(r.sections.every((s) => s.filled)).toBe(true);
  });

  it('flags missing required sections', () => {
    const tpl = { path: 'x.md', content: '## What\n\n## Why\n' };
    const body = '## What\nfilled.';
    const r = evaluate(body, tpl, { minLength: 5, requiredSections: ['Why'] });
    expect(r.missingRequired).toContain('Why');
  });

  it('parses YAML template required fields', () => {
    const yaml = `name: bug\nbody:\n  - type: textarea\n    id: repro\n    label: Steps to Reproduce\n    validations:\n      required: true\n`;
    const tpl = { path: 'x.yml', content: yaml };
    const body = '## Steps to Reproduce\nThese are the steps.';
    const r = evaluate(body, tpl, { minLength: 10 });
    // Section should be detected as filled
    expect(r.ok).toBe(true);
  });
});
