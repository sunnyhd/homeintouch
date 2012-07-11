var mongoose = require('mongoose');
var nettle = require('nettle');
var request = require('request');
var settings = require('../../data/settings');
var ObjectId = mongoose.Schema.ObjectId;

var store = nettle.store({ url: settings.database.mongodb, prefix: 'images' });

var Movie = new mongoose.Schema({
    movieid: { type: Number, index: true, unique: true },
    director: String,
    fanart: String,
    file: String,
    genre: String,
    imdbnumber: String,
    label: String,
    mpaa: String,
    plot: String,
    rating: Number,
    runtime: String,
    studio: String,
    thumbnail: String,
    thumbnailid: ObjectId,
    trailer: String,
    votes: String,
    year: Number
});

Movie.pre('remove', function(next) {
    if (!this.thumbnailid) return next();
    store.delete(this.thumbnailid, next);
});

Movie.pre('save', function(next) {
    if (!this.thumbnail) return next();

    var self = this;

    request(settings.images.url + this.thumbnail, function(err, res, body) {
        if (err) return next(err);

        // Siliently ignore failed image downloads
        if (res.statusCode !== 200 || !body) return next();

        var options = {
            content_type: res.headers['content-type']
        };

        store.put(new Buffer(body), options, function(err, image) {
            if (err) return next(err);

            self.thumbnailid = image._id;
            next()
        });
    });
});

module.exports = mongoose.model('Movie', Movie);