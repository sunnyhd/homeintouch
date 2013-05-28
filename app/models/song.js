var mongoose = require('mongoose');

var Song = new mongoose.Schema({
    songid: { type: Number, index: true, unique: true },
    title: String,
    album: String,
    albumid: Number,
    artist: String,
    artistid: [Number],
    file: String,
    track: Number,
    year: String,
    genre: String
});

module.exports = mongoose.model('Song', Song);