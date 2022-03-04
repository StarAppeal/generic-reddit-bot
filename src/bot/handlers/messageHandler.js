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
        return new Promise(async (resolve, reject) => {
            const ar = this.message.parent_id.split("_");
            if (ar[0] === "t1") {
                resolve((await this.streamHandler.getComment(ar[1])).body);
            } else if (ar[0] === "t3") {
                resolve((await this.streamHandler.getSubmission(ar[1])).selftext);
            }
            reject("unknown parentId type " + this.message.parent_id);
        });
    }

    markMessageAsRead() {
        this.streamHandler.markMessagesAsRead([this.message]);
    }

}