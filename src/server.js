require("dotenv").config();
const logger = require("./config/logger");

const app = require("./app");
const http = require("http");

const roboter = require("./roboter/genericBoter");

var port = process.argv[2] === "DEBUG" ? 81 : process.env.PORT;

http.createServer(app).listen(port, function () {
  console.log("App listens on port: " + this.address().port);

  try {
    roboter.inboxLoop();
    roboter.startStream();
  } catch (error) {
    logger.error(error);
  }
});
