var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({

    title: String,
    body: String,
    type: Schema.Types.ObjectId,
    ref: "Comment"
    
});

var Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment; 