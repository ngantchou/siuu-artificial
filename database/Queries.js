const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const QueriesSchema = new Schema({
    api: {
        type: String,
        required: true
    },
    apiCheck1: {
        type: String,
        required: true
    },
    apiCheck2: {
        type: String,
        required: true
    },

    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Queries = mongoose.model("keys", QueriesSchema);