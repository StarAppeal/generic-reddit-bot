const dateFormat = require("dateformat");
const maxAmountOfTries = 5;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = class PostHandler {
    constructor(post, logger, respondToID, streamHandler) {
        this.post = post;
        this.logger = logger;
        this.respondToID = respondToID;
        this.streamHandler = streamHandler;
    }

    async shouldReplyTo(botName, tries = 1) {
        return new Promise((resolve, reject) => {
            this.#findCommentToRespondTo().then(comment => {
                comment.expandReplies().then(c => {
                    c.replies.forEach(reply => {
                        if (reply.author.name === botName) reject(`Already replied to post with id ${this.post.id}.`);
                    });
                    resolve(comment);
                });
            }).catch(async (error) => {
                this.logger.info(error);
                if (tries <= maxAmountOfTries) {
                    this.logger.info("this was try number: " + tries)
                    await sleep(60000);
                    await this.#renewPost();
                    return resolve(this.shouldReplyTo(botName, tries + 1));
                } else {
                    return reject("max amount of tries (" + maxAmountOfTries + ") reached")
                }
            });
        });
    }

    logPost() {
        const strippedPost = {
            id: this.post.id,
            title: this.post.title,
            created: dateFormat(
                new Date(this.post.created_utc * 1000),
                "dd.mm.yyyy hh:MM:ss"
            ),
        };
        this.logger.info(`Found post: ${JSON.stringify(strippedPost)}`);
    }

    getText() {
        return this.post.selftext;
    }

    async #renewPost() {
        this.logger.info("renew post");
        this.post = await this.streamHandler.getSubmission(this.post.id);
    }

    async #findCommentToRespondTo() {
        return new Promise((resolve, reject) => {
            this.post.expandReplies().then(post => {
                post.comments.sort((a, b) => {
                    return a.created_utc - b.created_utc;
                }).forEach(comment => {
                    if (comment.author_fullname === this.respondToID) {
                        resolve(comment);
                    }
                });
                reject(`No comment found with respondToID "${this.respondToID}".`);
            });
        });
    }

}