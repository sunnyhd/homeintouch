var async = require('async');
var request = require('request');
var images = require('../../lib/images');
var settings = require('../../data/settings');

exports.cacheImages = function(Model, fields) {

    Model.pre('remove', function(next) {
        var self = this;

        var funcs = fields.map(function(attrs) {
            return function(callback) {
                if (!self[attrs.dest]) return callback();
                images.delete(self[attrs.dest], callback);
            };
        });

        async.parallel(funcs, next);
    });

    Model.pre('save', function(next) {
        var self = this;

        var funcs = fields.map(function(attrs) {
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

};