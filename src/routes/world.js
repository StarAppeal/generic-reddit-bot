var express = require("express");
var router = express.Router();

router.get("/welt", function (req, res, next) {
  res.status(200).send("Hallo Welt! Test.");
});

module.exports = router;
