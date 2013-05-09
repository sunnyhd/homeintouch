var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Artist = new mongoose.Schema({
    artistid: { type: Number, index: true, unique: true },
    artist: String,
    description: String,
    fanart: String,
    fanartUrl:String,
    genre: String,
    label: String,
    thumbnail: String,
    thumbnailUrl: String
});

helpers.cacheImages(Artist, [
    { src: 'thumbnail', dest: 'thumbnailUrl', newCache: true},
    { src: 'fanart', dest: 'fanartUrl', newCache: true}
]);

module.exports = mongoose.model('Artist', Artist);