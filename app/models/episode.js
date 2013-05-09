var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Episode = new mongoose.Schema({
    episodeid: { type: Number, index: true, unique: true },
    tvshowid: { type: Number, index: true },
    label: String,
    file: String,
    plot: String,
    rating: Number,
    firstaired: String,
    thumbnail: String,
    thumbnailUrl: String,
    episode: Number,
    season: Number,
    playcount: Number,
    resume: {
        position: Number,
        total: Number
    },
});

Episode.pre('save', function(next) {
    // Strip leading season/episode number
    
    var regex = /\d+x\d+\.\s+?/;
    var match = this.label.match(regex);

    if (match) {
        this.label = this.label.replace(match[0], '');
    }

    next();
});

helpers.cacheImages(Episode, [
    { src: 'thumbnail', dest: 'thumbnailUrl', newCache: true }
]);

module.exports = mongoose.model('Episode', Episode);