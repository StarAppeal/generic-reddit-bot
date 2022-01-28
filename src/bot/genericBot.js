const streamConfigCreator = require("../creator/streamConfigCreator");
const loggerCreator = require("../creator/loggerCreator");
const axios = require("axios");

const StreamHandler = require("./handlers/streamHandler");
const MessageHandler = require("./handlers/messageHandler");
const CommentHandler = require("./handlers/commentHandler");
const PostHandler = require("./handlers/postHandler");

const valueTextToLong = "Text zu lang zum kommentieren :(";

//TODO: we are currently not getting any notification if any error occurs

module.exports = class GenericBot {
    constructor(botConfig) {
        this.botConfig = botConfig;
        this.streamHandler = new StreamHandler(streamConfigCreator.createStreamConfig(botConfig));
        this.logger = loggerCreator._createLogger(botConfig);
    }

    async inboxLoop() {
        this.streamHandler.inboxStream(async (msg) => {
            this.logger.info(JSON.stringify(msg));
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
        // start the goddamn bot
    }

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

            if (result.length > 10000) {
                this.logger.info("Text too long");
                try {
                    result = await #getModifiedText(valueTextToLong);
                } catch (e) {
                    this.logger.error(e);
                }
            }

            return;
        } catch (e) {
            this.logger.error(e);
            return "";
        }
    }

}