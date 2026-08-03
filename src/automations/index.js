// sipmap — created by MUDIT AGRAWAL (muditagrawal2007) — MIT licensed
// Automation registry.

module.exports = {
  autoTriage: require('./autoTriage'),
  stalePr: require('./stalePr'),
  staleIssue: require('./staleIssue'),
  draftSuggest: require('./draftSuggest'),
  conflictDetect: require('./conflictDetect'),
  describeNudge: require('./describeNudge'),
  autoClose: require('./autoClose'),
  needsAuthorFeedback: require('./needsAuthorFeedback'),
  readyForReview: require('./readyForReview'),
};
