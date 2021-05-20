const dateFormat = require("dateformat");
const streamConfig = require("../config/streamConfig");
const logger = require("../config/logger");

const axios = require("axios");

function startStream() {
  streamConfig.stream.on("item", (post) => {
    processPost(post).catch((e) => error(e, post));
  });
}

async function processPost(post) {
  if (await replied(post.id)) {
    logger.info("Already replied to this post, skipping it.");
    return;
  }

  logPost(post);
  const wait = 60000;

  let comments;
  let automodComment;

  for (var i = 0; i < 10; i++) {
    if (i) {
      logger.info(`No Automod found on try #${i}`);
      logger.info(`Trying again in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
    }
    comments = await getComments(post.id);
    automodComment = extractAutomodComment(comments);
    if (automodComment) {
      break;
    }
  }

  if (!automodComment) {
    throw "Couldn't find Automod comment :(";
  }

  logger.info("Found Automod");

  if (process.argv[2] === "DEBUG") {
    console.log("Not replying because you are developing");
    return;
  }

  try {
    const modifiedText = await getModifiedText(post.selftext);
    await replyToComment(automodComment, modifiedText);
  } catch (e) {
    error(e, post);
  }
}

async function getComments(postId) {
  return streamConfig.wrap.getSubmission(postId).comments;
}

function extractAutomodComment(comments) {
  return comments.find((c) => c.author_fullname === process.env.AUTOMOD_ID);
}

async function replied(postId) {
  const comments = await streamConfig.wrap.getMe().getComments({
    limit: Math.floor(process.env.POLL_LIMIT * 1.5), // removed posts won't get streamed, but the comments to these removed posts still show up.
  });

  return comments.find((c) => c.link_id.includes(postId));
}

async function getModifiedText(text) {
  let url = process.env.REST_URL;
  const textObject = {
    text: text,
  };

  logger.info("Getting modified text from " + url);

  try {
    const response = await axios.post(process.env.REST_URL, textObject);
    logger.info("POST request took " + response.data.timeNeeded + "ms");
    return response.data.result;
  } catch (e) {
    throw e;
  }
}

async function replyToComment(comment, text) {
  if (text.length > 10000) {
    logger.info("Text too long");
    try {
      text = await getModifiedText("Text zu lang zum kommentieren :(");
    } catch (e) {
      throw e;
    }
  }
  logger.info("Replying now");
  comment.reply(text);
  logger.info("Text of reply was: " + text);
}

function logPost(post) {
  const strippedPost = {
    id: post.id,
    title: post.title,
    created: dateFormat(
      new Date(post.created_utc * 1000),
      "dd.mm.yyyy hh:MM:ss"
    ),
  };
  logger.info(`Found post: ${JSON.stringify(strippedPost)}`);
}

function error(str, post = {}) {
  try {
    logger.error([str, post.permalink].join(" "));
    for (user of process.env.DEVELOPERS.split(",")) {
      streamConfig.wrap.composeMessage({
        to: user,
        subject: process.env.BOT_NAME,
        text: str + "\n" + post.permalink,
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
