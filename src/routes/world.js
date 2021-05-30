var express = require("express");
var router = express.Router();

router.get("/world", function (req, res, next) {
  res.status(200).send("Hello World!");
});

module.exports = router;
