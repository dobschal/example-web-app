const mongoose = require("mongoose");

var articleSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    modifiedAt: { type: Date, required: true },
    image: { type: String, required: true }
});

module.exports = mongoose.model('Article', articleSchema);