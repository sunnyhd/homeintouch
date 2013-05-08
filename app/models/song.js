var mongoose = require('mongoose');

var Song = new mongoose.Schema({
    songid: { type: Number, index: true, unique: true },
    album: String,
    albumid: Number,
    artist: String,
    artistid: [Number],
    file: String,
    track: Number
});

module.exports = mongoose.model('Song', Song);