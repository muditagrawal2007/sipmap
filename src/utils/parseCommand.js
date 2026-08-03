// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Parse ":sipmap /<command> [args...]" from a comment body.
// Handles multi-line bodies, code fences, leading whitespace, and case.

const TRIGGER = ':sipmap';
const COMMAND_PREFIX = '/';

function parseCommand(body) {
  if (typeof body !== 'string') return null;

  // Scan every line; a command is the first line that begins with ":sipmap /".
  const lines = body.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trimStart();
    if (!line.toLowerCase().startsWith(TRIGGER)) continue;

    // Skip if inside a code fence (begin with triple backticks on previous line).
    const rest = line.slice(TRIGGER.length).trimStart();
    if (!rest.startsWith(COMMAND_PREFIX)) continue;

    const withoutSlash = rest.slice(COMMAND_PREFIX.length);
    const spaceIdx = withoutSlash.search(/\s/);
    let name, argsStr;
    if (spaceIdx === -1) {
      name = withoutSlash;
      argsStr = '';
    } else {
      name = withoutSlash.slice(0, spaceIdx);
      argsStr = withoutSlash.slice(spaceIdx + 1).trim();
    }
    name = name.toLowerCase();

    // Args are space-separated tokens; respect quoted strings.
    const args = tokenize(argsStr);

    return { name, args, raw: rest, line };
  }
  return null;
}

function tokenize(str) {
  const tokens = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (quote) {
      if (ch === quote) { quote = null; }
      else { current += ch; }
    } else if (ch === '"' || ch === '\'') {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) { tokens.push(current); current = ''; }
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function isCommand(body, name) {
  const parsed = parseCommand(body);
  return parsed !== null && parsed.name === name.toLowerCase();
}

module.exports = { parseCommand, isCommand, TRIGGER, COMMAND_PREFIX };
