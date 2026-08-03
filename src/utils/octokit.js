// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Helpers around Octokit / Probot's authenticated client.
// We never persist or log the client; we read it from context.

function getClient(context) {
  return context.octokit;
}

async function getInstallationId(context) {
  return context.payload.installation?.id || null;
}

async function getRepo(context) {
  return context.payload.repository;
}

module.exports = { getClient, getInstallationId, getRepo };
