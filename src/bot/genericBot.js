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
        this.logger = loggerCreator._createLogger(botConfig);
    }

    async inboxLoop() {
        this.streamHandler.inboxStream(async (msg) => {
            const messageHandler = new MessageHandler(msg, this.logger, this.streamHandler);
            if (messageHandler.isMention(this.botConfig.name)) {
                this.logger.info("MessageId is " + msg.id);
                const modifiedText = await this.#getModifiedText(await messageHandler.getTextToRespond());
                const comment = await this.streamHandler.getComment(msg.id);
                const replySuccessful = await new CommentHandler(comment, this.logger).reply(modifiedText);
                if (replySuccessful) {
                    messageHandler.markMessageAsRead();
                }
            }
        });
    }

    async startBot() {
        this.streamHandler.postStream(async (post) => {
            const postHandler = new PostHandler(post, this.logger, this.botConfig.respondToID, this.streamHandler);
            postHandler.logPost();
            postHandler.shouldReplyTo(this.botConfig.name).then(async (comment) => {
                this.logger.info("Post should be replied to.");
                let modifiedText = await this.#getModifiedText(postHandler.getText());
                let commentHandler = new CommentHandler(comment, this.logger);
                commentHandler.reply(modifiedText);
            }).catch(this.logger.info);
        });
    }


    //this is ugly
    async #getModifiedText(text) {
        const url = this.botConfig.restURL;
        const textObject = {
            text: text,
        };

        this.logger.info("Getting modified text from " + url);

        try {
            const response = await axios.post(url, textObject);
            this.logger.info("POST request took " + response.data.time + "ms");

            const result = response.data.text;

            if (result.length > maxCommentLength) {
                this.logger.info("Text too long");
                try {
                    result = await this.#getModifiedText(valueTextToLong);
                } catch (e) {
                    this.logger.error(e);
                }
            }

            return result;
        } catch (e) {
            this.logger.error(e);
            return "";
        }
    }

}