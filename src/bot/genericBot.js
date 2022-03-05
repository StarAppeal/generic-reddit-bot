const axios = require("axios");

const streamConfigCreator = require("../creator/streamConfigCreator");
const loggerCreator = require("../creator/loggerCreator");

const StreamHandler = require("./handlers/streamHandler");
const MessageHandler = require("./handlers/messageHandler");
const CommentHandler = require("./handlers/commentHandler");
const PostHandler = require("./handlers/postHandler");

const valueTextToLong = "Text zu lang zum kommentieren :(";
const maxCommentLength = 10000;

//TODO: we are currently not getting any notification if any error occurs
//TODO: if no respondToID is set, automatically respond to the post

module.exports = class GenericBot {
    constructor(botConfig) {
        this.botConfig = botConfig;
        this.streamHandler = new StreamHandler(streamConfigCreator.createStreamConfig(botConfig));
        this.logger = loggerCreator.createLogger(botConfig.name);
    }

    async inboxLoop() {
        this.logger.info("starting inboxLoop for Bot: " + this.botConfig.name);
        this.streamHandler.inboxStream(async (msg) => {
            const messageHandler = new MessageHandler(msg, this.logger, this.streamHandler);
            this.logger.info("MessageId is " + msg.id);
            if (messageHandler.isMention(this.botConfig.name)) {
                this.logger.info("message is a mention, gonna reply to it");
                const comment = await this.streamHandler.getComment(msg.id);
                const commentHandler = new CommentHandler(comment, this.logger);
                messageHandler.getTextToRespond()
                    .then(text => this.#getModifiedText(text))
                    .then(modifiedText => commentHandler.reply(modifiedText))
                    .then(reply => {
                        this.logger.info("Text of reply was: " + reply);
                        messageHandler.markMessageAsRead();
                    })
                    .catch(this.logger.error);
            }
        });
    }

    async startBot() {
        this.streamHandler.postStream(async (post) => {
            const postHandler = new PostHandler(post, this.logger, this.botConfig.respondToID, this.streamHandler);
            postHandler.logPost();
            postHandler.shouldReply(this.botConfig.name)
                .then(comment => {
                    const commentHandler = new CommentHandler(comment, this.logger);
                    this.logger.info("Post should be replied to.");
                    this.#getModifiedText(postHandler.getText())
                        .then(modifiedText => commentHandler.reply(modifiedText))
                        .then(reply => this.logger.info("Text of reply was" + reply))
                        .catch(this.logger.error);
                }).catch(this.logger.info);
        });
    }

    async #getModifiedText(text) {
        return new Promise((resolve, reject) => {
            const url = this.botConfig.restURL;
            const textObject = {
                text: text,
            };

            this.logger.info("Getting modified text from " + url);

            axios.post(url, textObject).then(response => {
                this.logger.info("POST request took " + response.data.time + "ms");
                let result = response.data.text;
                if (result.length > maxCommentLength) {
                    this.logger.info("Text too long");
                    return resolve(this.#getModifiedText(valueTextToLong));
                }
                resolve(result);
            }).catch(reject);
        });
    }
}