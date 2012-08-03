var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Episode = new mongoose.Schema({
    episodeid: { type: Number, index: true, unique: true },
    tvshowid: { type: Number, index: true },
    label: String,
    plot: String,
    rating: Number,
    firstaired: String,
    thumbnail: String,
    thumbnailid: ObjectId,
    episode: Number,
    season: Number,
    playcount: Number,
    resume: {
        position: Number,
        total: Number
    },
});

helpers.cacheImages(Episode, [
    { src: 'thumbnail', dest: 'thumbnailid' }
]);

module.exports = mongoose.model('Episode', Episode);