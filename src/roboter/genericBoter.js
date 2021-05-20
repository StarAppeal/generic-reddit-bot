const dateFormat = require("dateformat");
const streamConfig = require("../config/streamConfig");
const logger = require("../config/logger");

const axios = require("axios");

const alreadyReplied = (postId) =>
  streamConfig.wrap
    .getMe()
    .getComments({
      limit: Math.floor(process.env.POLL_LIMIT * 1.5), // removed posts won't get streamed, but the comments to these removed posts still show up.
    })
    .then((comments) => {
      for (comment of comments) {
        if (comment.link_id.includes(postId)) return true;
      }
      return false;
    });

function startStream() {
  streamConfig.stream.on("item", (post) => {
    logger.info(
      "found post with id: " +
        post.id +
        " and title " +
        post.title +
        " posted at: " +
        dateFormat(new Date(post.created_utc * 1000), "dd.mm.yyyy hh:MM:ss")
    );
    try {
      checkForAutomodComment(post.id, 60000)
        .then((c) => {
          if (c) replyToComment(post, c);
        })
        .catch((e) => error(e, post));
    } catch (e) {
      error(e, post);
    }
  });
}

async function checkForAutomodComment(postId, wait, i = 1) {
  const comments = await getComments(postId);
  if (await alreadyReplied(postId)) {
    logger.info("Already replied to this post, gonna skip.");
    return;
  }

  logger.info("Searching for Automod comment...");
  var c;
  for (comment of comments) {
    if (comment.author_fullname === process.env.AUTOMOD_ID) {
      logger.info("Comment is by Automod!");
      c = comment;
    }
  }
  if (!c) {
    logger.info(
      "No Automod comment found, checking again in " + wait + "ms..."
    );
    logger.info("This was try #" + i);
    if (i === 10) {
      throw "Couldn't find Automod after " + i + " tries, giving up.";
    }
    await new Promise((r) => setTimeout(r, wait));
    return checkForAutomodComment(postId, wait, i + 1);
  } else {
    return c;
  }
}

async function getComments(postId) {
  return streamConfig.wrap.getSubmission(postId).comments;
}

function replyToComment(post, comment) {
  if (process.argv[2] === "DEBUG") {
    console.log("I would reply but im locally started so I do not. Sorry mate");
    return;
  }
  let url = process.env.REST_URL;
  let objectToSend = {
    text: post.selftext,
  };
  logger.info("post requesting to url " + url);
  logger.info(JSON.stringify(objectToSend));
  axios
    .post(url, objectToSend)
    .then((response) => {
      let result = response.data;
      logger.info(
        "Didn't reply to post with ID: " + post.id + "... reply to it now!"
      );
      comment.reply(result.result);
      logger.info("Text of reply was: " + result.result);
      logger.info("post request took " + result.timeNeeded + "ms!");
    })
    .catch((error) => {
      error(error, post);
    });
}

function error(str, link = {}) {
  try {
    logger.error(str);
    for (user of process.env.DEVELOPER.split(",")) {
      streamConfig.wrap.composeMessage({
        to: user,
        subject: process.env.BOT_NAME,
        text: str + "\n" + link.permalink,
      });
    }
  } catch (error) {
    logger.error("Original error was: " + str);
    logger.error(error);
  }
}

module.exports = {
  startStream: startStream,
};
