require("dotenv").config();

const app = require("./app");
const http = require("http");
const world = require("./routes/world");

app.use("/hallo", world);
const roboter = require("./roboter/genericBoter");

var port = process.argv[2] === "DEBUG" ? 81 : process.env.PORT;

http.createServer(app).listen(port, function () {
  console.log("App listens on port: " + this.address().port);
  roboter.startStream();
});
