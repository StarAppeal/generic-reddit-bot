const dateFormat = require('dateformat');
const streamConfig = require("../config/streamConfig")
const logger = require("../config/logger");

const axios = require('axios');

const alreadyReplied = postId =>
    streamConfig.wrap.getMe().getComments({
        limit: Math.floor(process.env.POLL_LIMIT * 1.5) // removed posts won't get streamed, but the comments to these removed posts still show up.
    }).then(comments => {
        for (comment of comments) {
            if (comment.link_id.includes(postId)) return true;
        }
        return false;
    });

function startStream() {
    streamConfig.stream.on("item", post => {
        logger.info("found post with id: " + post.id + " posted at: " + dateFormat(new Date(post.created_utc * 1000), "dd.mm.yyyy hh:MM:ss"));
        streamConfig.wrap.getSubmission(post.id).comments.then(async (comments) => {
            if (await alreadyReplied(post.id)) {
                logger.info("Already replied to this post, gonna skip.");
                return;
            }
            try {
                checkForAutomodComment(comments, 60000).then(c => {if (c !== null) replyToComment(post, c)}).catch(e => logger.error(e));
            } catch (e) {
                logger.error(e);
            }
        });
    });
}

async function checkForAutomodComment(comments, wait, i = 1) {
    logger.info('Searching for Automod comment...');
    var c;
    for (comment of comments) {
        if (comment.author_fullname === process.env.AUTOMOD_ID) {
            c = comment;
        }
    }
    if (!c) {
        logger.info('No Automod Comment found, checking again soon...');
        logger.info('This was try #' + i);
        if (i === 10) {
          logger.info("Couldn't find autmod, after " + i + " tries, giving up.");
          return null;
        }
        await new Promise(r => setTimeout(r, wait));
        return checkForAutomodComment(comments, wait, i + 1)
    } else {
        logger.info('Automod comment found!');
        return c;
    }
}

function replyToComment(post, comment) {
  if (process.argv[2] === 'DEBUG') {
        console.log("I would reply but im locally started so I do not. Sorry mate");
        return;
  }
    let url = process.env.REST_URL;
    let objectToSend = {
        text: post.selftext
    };
    logger.info("post requesting to url " + url);
    logger.info(JSON.stringify(objectToSend));
    axios.post(url, objectToSend).then(response => {
        let result = response.data;
        logger.info("Didn't reply to post with ID: " + post.id + "... reply to it now!");
        comment.reply(result.result);
        logger.info('Text of reply was: ' + result.result);
        logger.info("post request took " + result.timeNeeded + "ms!");
    }).catch(error => {
        logger.error(error);
    });

}

module.exports = {
    startStream: startStream
};
