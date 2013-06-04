var async = require('async');
var request = require('request');
var images = require('../../lib/images');
var settings = require('../../config');
var url = require('url');
var imageCache = require('../../lib/image_cache');

var predefinedWidths = {
    fanart: 1024,
    thumbnail: 250,
    'art.banner': 758
};

var imagePrefix = 'image://';

var removeLastSlash = function(path) {
    var lastCharIndex = path.length - 1;
    var lastChar = path.charAt(lastCharIndex);

    if (lastChar === '/') {
        return path.slice(0, -1);
    } else {
        return path;
    }
};

var retrieveSourceUrl = function(self, attrs, callback) {
    if (attrs.src.indexOf('.') !== 0) {
        // The source is an inner object
        var srcArray = attrs.src.split('.');
        var sourceObj = self;
        for (var i = 0; i < srcArray.length; i++) {
            if (!sourceObj) {
                return callback();
            }
            sourceObj = sourceObj[srcArray[i]];
        }
        return sourceObj;
    } else {
        return self[attrs.src];
    }
}

var buildImageUrl = function(url) {

    var tempURL = url.substring(imagePrefix.length);
    tempURL = removeLastSlash(tempURL);
    var imagePath = encodeURIComponent(tempURL);
    // The URL is encoded again because it is decoded in Image Cache Server
    imagePath = encodeURIComponent(imagePath);

    return settings.images.importUrl + imagePrefix + imagePath;
};

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

                var source = retrieveSourceUrl(self, attrs, callback);
                
                if (!source) return callback();

                var imageUrl;

                var urlFromXbmc = source;
                if (urlFromXbmc.indexOf(imagePrefix) === 0) {
                    imageUrl = buildImageUrl(urlFromXbmc);
                }

                var options = {
                    url: imageUrl,
                    encoding: 'binary'
                };

                console.log('Caching Image - Image URL: ' + options.url);

                if (attrs.newCache) {

                    var width = predefinedWidths[attrs.src];
                    //Save images in cache server
                    
                    imageCache.save(imageUrl, width)
                    .then(function(imageId) {
                        self[attrs.dest] = settings.cache.localUrl + imageId;
                        callback();
                    })
                    .fail(function(err) {
                        callback();
                    })
                    .done();  
                } else {

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
                            callback();
                         });
                    });
                }
            }
        });

        async.parallel(funcs, next);
    });
};