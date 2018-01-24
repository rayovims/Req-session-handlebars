var express = require("express");
var router = express.Router();
var path = require("path");
var axios = require("axios");
var cheerio = require("cheerio");
var mongojs = require("mongojs");
var User = require("../models/user");
var mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/crypto");

router.get("/", function (req, res) {
    if (req.session.user) {
        res.redirect("/dashboard")
    }
    res.sendFile(path.join(__dirname, "../public/home.html"));
});

router.get("/dashboard", function (req, res) {
    if (req.session.user) {
        res.render("index", { user: req.session.user });
    } else {
        res.redirect("/")
    }
})

router.post("/api/coinwatched", function (req, res) {
    User.update({ _id: req.session.user._id }, { $push: { coins: { coinName: req.body.coinName, coinPrice: req.body.coinPrice } } })
        .then(function () {
            return User.findOne({ "username": req.session.user.username, "password": req.session.user.password })
        }).then(function (dbUser) {
            req.session.user = dbUser;
            res.redirect("/dashboard");
        })
        .catch(function (err) {
            res.json(err);
        })
});

router.post("/login", function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({ "username": username, "password": password })
        .then(function (dbUser) {
            req.session.user = dbUser;
            res.redirect("/dashboard");
        })
        .catch(function (err) {
            res.json(err);
        });
});

router.get("/logout", function (req, res) {
    req.session.destroy(function (err) {
        if (err) {
            res.negotiate(err)
        }
        res.redirect("/");
    })
});

router.post("/register", function (req, res) {
    User.create(req.body)
        .then(function (dbUser) {
            res.json(dbUser);
        })
})

// setInterval(refresh, 1000000);

retriveCoins();
function retriveCoins() {
    var coinsToBeCompared = [];
    var scrapedCoinInfo = [];
    var results = [];
    var names = [];
    var prices = [];
    var percentages = [];
    var rating = [];
    axios.get("https://coinmarketcap.com/").then(function (response) {

        var $ = cheerio.load(response.data);

        $("a.currency-name-container").each(function (i, element) {
            var name = $(element).text();

            names.push(name)
        });
        $("a.price").each(function (i, element) {
            var price = $(element).text();

            prices.push(price)
        });
        for (var i = 0; i < names.length; i++) {
            results.push({
                name: names[i],
                price: prices[i],
            })
        }
        User.find({})
            .then(function (allusers) {
                allusers.forEach(value => {
                    value.coins.forEach(coins => {
                        coinsToBeCompared.push({
                            firstName: value.firstname,
                            userEmail: value.email,
                            coinName: coins.coinName,
                            coinPrice: "$" + coins.coinPrice
                        })
                    })
                });
                coinsToBeCompared.forEach(userCoins => {
                    // console.log(userCoins);
                    function find(coin) {
                        if (coin.name == userCoins.coinName && coin.price == userCoins.coinPrice) {
                            console.log("email to");
                            const msg = {
                                to: userCoins.userEmail,
                                from: 'CryptoAlert@donotreply.com',
                                subject: 'Your coin has reached the limit',
                                html: '<strong>Hello ' + userCoins.firstName + ", " + userCoins.coinName + " has reached " + userCoins.coinPrice + '!</strong>',
                            };
                            sgMail.send(msg);
                        }
                    }
                    // console.log(results);
                    results.find(find);
                })
            })
    })
}

router.get("/api/coins", function (req, res) {
    var results = [];
    var names = [];
    var prices = [];
    var percentages = [];
    var rating = [];
    axios.get("https://coinmarketcap.com/").then(function (response) {

        var $ = cheerio.load(response.data);

        $("a.currency-name-container").each(function (i, element) {
            var name = $(element).text();

            names.push(name)
        });
        $("a.price").each(function (i, element) {
            var price = $(element).text();

            prices.push(price)
        });
        $("td.percent-24h").each(function (i, element) {
            var percent = $(element).text();

            percentages.push(percent)
        });
        for (var i = 0; i < names.length; i++) {
            results.push({
                name: names[i],
                price: prices[i],
                percent: percentages[i],
            })
        }
        res.json(results);
    });
})

module.exports = router;