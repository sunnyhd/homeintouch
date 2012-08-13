var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var TVShow = new mongoose.Schema({
    tvshowid: { type: Number, index: true, unique: true },
    fanart: String,
    fanartid: ObjectId,
    genre: String,
    label: String,
    showtitle: String,
    mpaa: String,
    plot: String,
    rating: Number,
    studio: String,
    thumbnail: String,
    thumbnailid: ObjectId,
    votes: String,
    year: Number,
    playcount: Number,
    premiered: String,
    cast: [{ name: String, role: String, thumbnail: String }]
});

helpers.cacheImages(TVShow, [
    { src: 'thumbnail', dest: 'thumbnailid' },
    { src: 'fanart', dest: 'fanartid' }
]);

module.exports = mongoose.model('TVShow', TVShow);