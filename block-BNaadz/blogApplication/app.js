var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var session = require("express-session");
var flash = require("connect-flash")
var MongoStore = require("connect-mongo");
require("dotenv").config();

var indexRouter = require("./routes/index");
var articleRouter = require("./routes/article");
var usersRouter = require("./routes/users");
var commentRouter = require("./routes/comment");
var auth = require("./middlewares/auth")

mongoose.connect("mongodb://127.0.0.1:27017/blogApplication");
mongoose.connection.once("connected", () => {
  console.log("connected to database");
});
mongoose.connection.on("error", (err) => {
  console.log(err);
});
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost/blogApplication",
    }),
  })
);
app.use(flash())

app.use(auth.userInfo)
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/comments", commentRouter);
app.use("/articles", articleRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
