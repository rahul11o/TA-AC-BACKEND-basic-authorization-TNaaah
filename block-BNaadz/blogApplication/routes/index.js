var express = require("express");
const session = require("express-session");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  // console.log(req.user, req.session, "ooh yeah")
  // console.log(res.locals.user, "ooh yeah")
  let info = req.flash("info")[0]
  res.render("index.ejs", { info });
});

module.exports = router;
