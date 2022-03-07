module.exports = class CommentHandler {
    constructor(comment, logger) {
        this.comment = comment;
        this.logger = logger;
    }

    async reply(text, debug) {
        return new Promise((resolve, reject) => {
            if (debug) {
                reject("Not replying because you are developing");
                return; 
            }
            this.logger.info("Replying now");
            this.comment
                .reply(text)
                .then(() => resolve(text))
                .catch(reject);
        });

    }
}