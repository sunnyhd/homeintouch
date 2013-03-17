var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Season = new mongoose.Schema({
    season: Number,
    tvshowid: Number,
    fanart: String,
    fanartid: ObjectId,
    showtitle: String,
    watchedepisodes : Number,
    episode: Number,
    playcount: Number, 
    thumbnail: String, 
    thumbnailid: ObjectId, 
    bannerid: ObjectId,
    art: { banner: String }
});

helpers.cacheImages(Season, [
    { src: 'thumbnail', dest: 'thumbnailid' },
    { src: 'fanart', dest: 'fanartid' },
    { src: 'art.banner', dest: 'bannerid' }
]);

module.exports = mongoose.model('Season', Season);