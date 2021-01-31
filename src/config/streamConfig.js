const {
  SubmissionStream
} = require("snoostorm");

const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');

const r = new Snoowrap({
  userAgent: 'linux:'+process.env.BOT_NAME+':1.0 (by ' + process.env.DEVELOPER + ')',
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  refreshToken: process.env.REFRESH_TOKEN
});

const submissionstream = new SubmissionStream(r, {
  subreddit: process.env.SUBREDDIT,
  limit: parseInt(process.env.POLL_LIMIT),
  pollTime: parseInt(process.env.POLL_TIME)
});

module.exports = {stream: submissionstream, wrap: r};
