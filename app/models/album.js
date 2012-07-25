var mongoose = require('mongoose');

var Album = new mongoose.Schema({
    albumid: { type: Number, index: true, unique: true },
    artist: String,
    artistid: Number,
    label: String
});

module.exports = mongoose.model('Album', Album);