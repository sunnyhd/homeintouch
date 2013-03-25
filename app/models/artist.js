var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Artist = new mongoose.Schema({
    artistid: { type: Number, index: true, unique: true },
    artist: String,
    description: String,
    fanart: String,
    fanartid: ObjectId,
    genre: String,
    label: String,
    thumbnail: String,
    thumbnailid: ObjectId
});

helpers.cacheImages(Artist, [
    { src: 'thumbnail', dest: 'thumbnailid' },
    { src: 'fanart', dest: 'fanartid' }
]);

module.exports = mongoose.model('Artist', Artist);