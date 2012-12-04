var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Movie = new mongoose.Schema({
    movieid: { type: Number, index: true, unique: true },
    director: String,
    fanart: String,
    fanartid: ObjectId,
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
    thumbnailid: ObjectId,
    trailer: String,
    votes: String,
    year: Number,
    playcount: Number,
    resume: {
        position: Number,
        total: Number
    }
});

helpers.cacheImages(Movie, [
    { src: 'thumbnail', dest: 'thumbnailid' },
    { src: 'fanart', dest: 'fanartid' }
]);

module.exports = mongoose.model('Movie', Movie);