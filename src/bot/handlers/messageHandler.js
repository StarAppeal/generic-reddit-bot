const messageTypeUsernameMention = 'username_mention'

module.exports = class MessageHandler {
    constructor(message, logger, streamHandler) {
        this.message = message;
        this.logger = logger;
        this.streamHandler = streamHandler;
    }

    isMention(botName) {
        return this.message.type === messageTypeUsernameMention ||
            this.message.body.includes(`u/${botName}`)
    }

    async getTextToRespond() {
        const ar = this.message.parent_id.split("_");
        if (ar[0] === "t1") {
            return (await this.streamHandler.getComment(ar[1])).body;
        } else if (ar[0] === "t3") {
            return (await this.streamHandler.getSubmission(ar[1])).selftext;
        }
        this.logger.error("unknown parentId type " + this.message.parent_id);
        return null;
    }

    markMessageAsRead() {
        this.streamHandler.markMessagesAsRead([this.message]);
    }

}