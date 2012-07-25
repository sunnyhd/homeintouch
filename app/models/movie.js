var async = require('async');
var mongoose = require('mongoose');
var request = require('request');
var images = require('../../lib/images');
var settings = require('../../data/settings');
var ObjectId = mongoose.Schema.ObjectId;

// Attributes for which to import images
var imageAttrs = [
    { src: 'thumbnail', dest: 'thumbnailid' },
    { src: 'fanart', dest: 'fanartid' }
];

var Movie = new mongoose.Schema({
    movieid: { type: Number, index: true, unique: true },
    director: String,
    fanart: String,
    fanartid: ObjectId,
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
    var self = this;

    var funcs = imageAttrs.map(function(attrs) {
        return function(callback) {
            if (!self[attrs.dest]) return callback();
            images.delete(self[attrs.dest], callback);
        };
    });

    async.parallel(funcs, next);
});

Movie.pre('save', function(next) {
    var self = this;

    var funcs = imageAttrs.map(function(attrs) {
        return function(callback) {
            if (!self[attrs.src]) return callback();

            var options = {
                url: settings.images.url + self[attrs.src],
                encoding: 'binary'
            };

            // Make HTTP request for image
            request(options, function(err, res, body) {
                if (err) return callback(err);

                // Siliently ignore failed image downloads
                if (res.statusCode !== 200 || !body) return callback();

                var options = { content_type: res.headers['content-type'] };

                // Store in GridFS
                images.put(new Buffer(body), options, function(err, image) {
                    if (err) return callback(err);

                    // Save image id
                    self[attrs.dest] = image._id;
                    callback()
                });
            });
        }
    });

    async.parallel(funcs, next);
});

module.exports = mongoose.model('Movie', Movie);