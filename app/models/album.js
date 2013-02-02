var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Album = new mongoose.Schema({
    albumid: { type: Number, index: true, unique: true },
    artist: String,
    artistid: Number,
    label: String,
    playcount: Number, 
    genre: String, 
    rating: Number, 
    thumbnail: String,
    thumbnailid: ObjectId, 
    year: String, 
    mood: String,
    style: String
});

helpers.cacheImages(Album, [
    { src: 'thumbnail', dest: 'thumbnailid' }
]);

module.exports = mongoose.model('Album', Album);