const { SubmissionStream, InboxStream } = require("snoostorm");

const Snoowrap = require("snoowrap");
const Snoostorm = require("snoostorm");

function createStreamConfig(botConfig, debug){
  const snoowrap = new Snoowrap({
    userAgent:
    `linux:${botConfig.name}:1.0 (by ${botConfig.developers})`,
    clientId: botConfig.clientId,
    clientSecret: botConfig.clientSecret,
    refreshToken: botConfig.refreshToken,
  });
  snoowrap.config({continueAfterRatelimitError: true, debug})

  const submissionStream = new SubmissionStream(snoowrap, {
    subreddit: botConfig.subreddit,
    limit: botConfig.pollLimit,
    pollTime: botConfig.pollTime,
  });

  const inboxStream = new InboxStream(snoowrap, {
    filter: "unread",
    pollTime: botConfig.pollTime,
    limit: botConfig.pollLimit
  });

  return {inboxStream, submissionStream, wrap: snoowrap}
}

module.exports = { createStreamConfig };
