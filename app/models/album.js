var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Album = new mongoose.Schema({
    albumid: { type: Number, index: true, unique: true },
    artist: String,
    artistid: [Number],
    label: String,
    playcount: Number, 
    genre: String, 
    rating: Number, 
    thumbnail: String,
    thumbnailUrl: String,
    year: String, 
    mood: String,
    style: String,
    displayartist: String
});

helpers.cacheImages(Album, [
    { src: 'thumbnail', dest: 'thumbnailUrl', newCache: true }
]);

module.exports = mongoose.model('Album', Album);