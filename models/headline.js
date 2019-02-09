var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HeadlineSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    link: {
        link: String,
        required: true
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Headline = mongoose.model("Headline", HeadlineSchema);

module.exports = Headline;