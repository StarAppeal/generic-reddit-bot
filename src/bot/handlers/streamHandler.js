module.exports = class StreamHandler {
    constructor(streamConfig) {
        this.streamConfig = streamConfig;
    }

    async sendPrivateMessage(to, subject, text) {
        this.streamConfig.wrap.composeMessage({
            to: to,
            subject: subject,
            text: text,
        });
    }

    async getUnreadMessages() {
        return this.streamConfig.wrap.getUnreadMessages();
    }

    async getSubmission(messageId) {
        return await this.streamConfig.wrap.getSubmission(messageId);
    }

    async getComment(messageId) {
        return await this.streamConfig.wrap.getComment(messageId);
    }

    async inboxStream(callback){
        return this.streamConfig.inboxStream.on("item", callback);
    }

    markMessagesAsRead(messages){
        this.streamConfig.wrap.markMessagesAsRead(messages);
    }

}