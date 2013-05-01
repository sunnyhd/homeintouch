var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var TVShow = new mongoose.Schema({
    tvshowid: { type: Number, index: true, unique: true },
    fanart: String,
    fanartUrl: String,
    genre: String,
    label: String,
    showtitle: String,
    mpaa: String,
    plot: String,
    rating: Number,
    studio: String,
    thumbnail: String,
    thumbnailUrl: String,
    votes: String,
    year: Number,
    playcount: Number,
    premiered: String,
    cast: [{ name: String, role: String, thumbnail: String }],
    art: { banner: String },
    bannerUrl: String
});

helpers.cacheImages(TVShow, [
    { src: 'thumbnail', dest: 'thumbnailUrl', newCache: true },
    { src: 'fanart', dest: 'fanartUrl', newCache: true },
    { src: 'art.banner', dest: 'bannerUrl', newCache: true }
]);

module.exports = mongoose.model('TVShow', TVShow);