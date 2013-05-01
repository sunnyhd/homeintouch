var mongoose = require('mongoose');
var helpers = require('./helpers');
var ObjectId = mongoose.Schema.ObjectId;

var Season = new mongoose.Schema({
    season: Number,
    tvshowid: Number,
    fanart: String,
    fanartUrl: String,
    showtitle: String,
    watchedepisodes : Number,
    episode: Number,
    playcount: Number, 
    thumbnail: String, 
    thumbnailUrl: String, 
    bannerUrl: ObjectId,
    art: { banner: String }
});

helpers.cacheImages(Season, [
    { src: 'thumbnail', dest: 'thumbnailUrl', newCache: true },
    { src: 'fanart', dest: 'fanartUrl', newCache: true },
    { src: 'art.banner', dest: 'bannerUrl', newCache: true}
]);

module.exports = mongoose.model('Season', Season);