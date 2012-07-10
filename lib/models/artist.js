var mongoose = require('mongoose');

var Artist = new mongoose.Schema({
    artistid: { type: Number, index: true, unique: true },
    artist: String,
    description: String,
    fanart: String,
    genre: String,
    label: String,
    thumbnail: String
});

module.exports = mongoose.model('Artist', Artist);