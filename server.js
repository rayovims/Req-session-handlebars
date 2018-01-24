var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var session = require("express-session");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var expressValidator = require("express-validator");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 8080;

// app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ secret: "d3b29dbu93hdu2hdesid", resave: false, saveUninitialized: true }))
app.use(express.static("public"));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var routes = require("./controllers/coin.js");

app.use("/", routes);

app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});