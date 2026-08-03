// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Check a user's permission level on a repo.
// Returns 'admin' | 'maintain' | 'write' | 'triage' | 'read' | 'none' | null.

async function getUserPermission(context, username) {
  if (!username) return null;
  const { owner, repo } = context.repo();
  try {
    const { data } = await context.octokit.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username,
    });
    return data.user?.permission || data.permission || null;
  } catch (err) {
    if (err.status === 404) return 'none';
    throw err;
  }
}

const PRIVILEGED_LEVELS = new Set(['admin', 'maintain']);

async function isMaintainer(context, username) {
  const perm = await getUserPermission(context, username);
  return PRIVILEGED_LEVELS.has(perm);
}

const FRIENDLY_DENIAL = (username) =>
  `Hey @${username} — this command needs maintainer access on this repo. Ask a maintainer to run it or grant you write access.`;

module.exports = {
  getUserPermission,
  isMaintainer,
  PRIVILEGED_LEVELS,
  FRIENDLY_DENIAL,
};
