//DEPENDENCIES
//=========================
// Express for routing
var express = require("express");

// Morgan for logging
var logger = require("morgan");

// Mongoose for object modeling
var mongoose = require("mongoose");

//USED TO SCRAPE
//=========================
// Axios and cheerio for scraping
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models/Index");

//CONNECTION
//=========================
// Initialize express
var app = express();


// Use Morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make a static folder public
app.use(express.static("public"));

// HANDLEBARS
//=========================
// Express handlebars for rendering db content to dom
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//Routes
//=========================

app.get("/", function (req, res) {
    res.render('index')
});

app.get("/news", function (req, res) {

    // Axios grabs the body of the html
    axios.get("https://www.sfchronicle.com/").then(function (response) {
        // Then, load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        const HeadlinesInProgress = [];

        // Grab every article in the prem-block class, and do the following: 
        $(".inner-block").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the title, summary, image and link of every article (headline) and save them as proporties of the result object
            result.title = $(this).children("headline").text();
            result.summary = $(this).children(".blurb").text();
            // result.summary = $(this).children("span").text();
            result.link = "https://www.sfchronicle.com/" + $(this).children(".headline").children("a").attr("href");
            // result.link = $(this).find("without_u").attr("href")
            console.log(result)

            HeadlinesInProgress.push(result)
        })
    }).then(() => {
        db.Headline.create(HeadlinesInProgress)
        res.send("Hello")
    })
});

app.get("/headlines", function (req, res) {
    db.Headline.find({})
        .then(function (dbHeadline) {
            res.json(dbHeadline);
        })
        .catch(function (err) {
            console.log(err);
        });
});

// Route for getting all headlines from the db
app.post("/save", function (req, res) {
    // console.log(req.body)
    db.Headline.create(req.body)
        .then(function (dbHeadline) {
            // If we were able to successfully find Headlines, send them back to the client
            console.log(dbHeadline)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err);
        });
})

app.put("/delete", function (req, res) {
    // console.log(req.body.id)
    db.Haedline.remove({ _id: req.body.id })
        .then(function (dbHeadline) {
            // If we were able to successfully find Headlines, send them back to the client
            console.log(dbHeadline)
        }).catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err);
        });
});

app.delete("/delete-all", function (req, res) {
    db.Headline.remove({})
        .then(function (dbHeadline) {
            // If we were able to successfully find Headlines, send them back to the client
            console.log("All Deleted")
        }).catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err);
        });
});

app.put("/delete-note", function (req, res) {
    console.log(req.body.id)
    db.Note.remove({ _id: req.body.id })
        .then(function (dbNote) {
            // If we were able to successfully find Headlines, send them back to the client
            console.log(dbNote)
        }).catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err);
        });
});

app.post("/new-note", function (req, res) {
    // console.log({'title': req.body.title, 'body': req.body.body}, req.body.artId)
    db.Note.create({ 'title': req.body.title, 'body': req.body.body })
        .then(function (dbNote) {
            // If we were able to successfully find Headlines, send them back to the client
            console.log(req.body.artId)
            return db.Headline.findOneAndUpdate({ _id: req.body.artId }, { $push: { note: dbNote._id } }, { new: true });
        }).then(function (dbHeadline) {
            console.log(dbHeadline)
        }).catch(function (err) {
            // If an error occurred, send it to the client
            console.log(err);
        });
});

// Route for grabbing a specific Headline by id, populate it with its note
app.get("/headline-notes/:id", function (req, res) {
    db.Headline.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbHeadline) {
            console.log(dbHeadline)
            res.render('listing', { data: dbHeadline });
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Start the server
app.listen(3000, function () {
    console.log("App running on port 3000!");
});