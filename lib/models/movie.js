var mongoose = require('mongoose');

var Movie = new mongoose.Schema({
    movieid: { type: Number, index: true, unique: true },
    director: String,
    fanart: String,
    file: String,
    genre: String,
    imdbnumber: String,
    label: String,
    mpaa: String,
    plot: String,
    rating: Number,
    runtime: String,
    studio: String,
    thumbnail: String,
    trailer: String,
    votes: String,
    year: Number
});

module.exports = mongoose.model('Movie', Movie);