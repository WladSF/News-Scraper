//Dependencies
//=========================
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

//Used to scrape
//=========================
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models/Index");

//Connection
//=========================
var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
//=========================
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

mongoose.connect("mongodb://localhost/news-scraper", { useNewUrlParser: true });

//Routes
//=========================

app.get("/news", function (req, res) {
    axios.get("https://www.sfchronicle.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        $("headline h2").each(function (i, element) {

            var result = {};

            result.title = $(this).children("h2").text();
            result.summary = $(this).children("p").text();
            result.link = $(this).children("a").attr("href");

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

app.get("/headlines", function (req, res) {
    db.Headline.find({})
        .then(function (dbHeadline) {
            res.json(dbHeadline);
        })
        .catch(function (err) {
            res.json(err);
        });
});


// Route for grabbing a specific Article by id, populate it with its note
app.get("/headlines/:id", function (req, res) {
    db.Headline.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbHeadline) {
            res.json(dbHeadline);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/headlines/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Headline.findOneAndUpdate({ _id: req.params.id }, { note: dbNote_id }, { new: true });
        })
        .then(function (dbHeadline) {
            res.json(dbHeadline);
        })
        .catch(function (err) {
            res.json(err);
        });
})

// Start the server
app.listen(3000, function () {
    console.log("App running on port 3000!");
});