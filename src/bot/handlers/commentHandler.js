//TODO

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

        if (text.length > 10000) {
            this.logger.info("Text too long");
            try {
                // TODO: how to do this beautifully?
                // text = await getModifiedText("Text zu lang zum kommentieren :(");
            } catch (e) {
                this.logger.error(e);
                return false;
            }
        }
        this.logger.info("Replying now");
        this.comment
            .reply(text)
            .then(() => this.logger.info("Text of reply was: " + text))
            .catch((error) => this.logger.error(error));
        return true;
    }

}