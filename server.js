var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

//Routes
//=========================

app.get("/news", function (req, res) {
    axios.get("https://www.sfchronicle.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        $("headline h2").each(function (i, element) {

            var result = {};

            result.title = $(this)
                .children("a")
                .text();
            result.link = $(this)
                .children("a")
                .attr("href");
            db.Headline.create(result)
                .then(function (dbHeadline) {
                    console.log(dbHeadline);
                })
                .catch(function (err) {
                    console.log(er);
                });
        });

        res.send("Scrape completed");
    });
});

app.get("/headlines", function(req, res) {
    db.Headline.find({})
    .then(function(dbHeadline) {
        res.json(dbHeadline);
    })
    .catch(function(err) {
        res.json(err);
    });
});

app.get("/headlines/:id")