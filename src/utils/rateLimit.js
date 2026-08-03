// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Lightweight in-memory rate limiter for anti-flood protection.
// One process-instance keeps counters keyed by repo/PR/user.

const counters = new Map(); // key -> { count, windowStart }
const lastSeen = new Map(); // key -> timestamp

function nowMs() { return Date.now(); }

function key(...parts) { return parts.join('::'); }

function withinWindow(ts, windowSec) {
  return nowMs() - ts < windowSec * 1000;
}

function shouldAllow({
  repoId,
  prNumber,
  user,
  command,
  limits,
}) {
  const sec = limits.debounceSeconds || 600;

  // Debounce: same user + same command + same PR within window
  const debounceKey = key(repoId, prNumber || 'issue', user, command);
  const last = lastSeen.get(debounceKey);
  if (last && withinWindow(last, sec)) {
    return { allow: false, reason: 'debounce' };
  }

  // Per-user-per-PR hourly limit
  const hourSec = 3600;
  const userKey = key(repoId, prNumber || 'issue', user);
  const userEntry = counters.get(userKey);
  if (!userEntry || !withinWindow(userEntry.windowStart, hourSec)) {
    counters.set(userKey, { count: 1, windowStart: nowMs() });
  } else if (userEntry.count >= (limits.perUserPerPR || 3)) {
    return { allow: false, reason: 'per-user-pr-limit' };
  } else {
    userEntry.count += 1;
  }

  // Per-PR hourly limit
  const prKey = key(repoId, prNumber || 'issue');
  const prEntry = counters.get(prKey);
  if (!prEntry || !withinWindow(prEntry.windowStart, hourSec)) {
    counters.set(prKey, { count: 1, windowStart: nowMs() });
  } else if (prEntry.count >= (limits.perPRPerHour || 20)) {
    return { allow: false, reason: 'per-pr-limit' };
  } else {
    prEntry.count += 1;
  }

  // Per-repo hourly limit
  const repoKey = key(repoId);
  const repoEntry = counters.get(repoKey);
  if (!repoEntry || !withinWindow(repoEntry.windowStart, hourSec)) {
    counters.set(repoKey, { count: 1, windowStart: nowMs() });
  } else if (repoEntry.count >= (limits.perRepoPerHour || 100)) {
    return { allow: false, reason: 'per-repo-limit' };
  } else {
    repoEntry.count += 1;
  }

  lastSeen.set(debounceKey, nowMs());
  return { allow: true };
}

function _reset() {
  counters.clear();
  lastSeen.clear();
}

module.exports = { shouldAllow, _reset };
