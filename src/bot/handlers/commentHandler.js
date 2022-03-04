module.exports = class CommentHandler {
    constructor(comment, logger) {
        this.comment = comment;
        this.logger = logger;
    }

    async reply(text, debug = false) {   
        if (debug) {
            this.logger.info("Not replying because you are developing");
            return false;
        }

        this.logger.info("Replying now");
        this.comment
            .reply(text)
            .then(() => this.logger.info("Text of reply was: " + text))
            .catch(this.logger.error);
        return true;
    }

}