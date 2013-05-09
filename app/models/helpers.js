var async = require('async');
var request = require('request');
var images = require('../../lib/images');
var settings = require('../../config');
var url = require('url');

var musicExtensions = ['m4a', 'mp3'];

var predefinedWidths = {
    fanart: 1024,
    thumbnail: 250,
    'art.banner': 758
};

var removeLastSlash = function(path) {
    var lastCharIndex = path.length - 1;
    var lastChar = path.charAt(lastCharIndex);

    if (lastChar === '/') {
        return path.slice(0, -1);
    } else {
        return path;
    }
};

var isMusicExtension = function(path) {

    var pathArray = removeLastSlash(path).split('\.');
    var fileExtension = (pathArray[pathArray.length - 1]).toLowerCase();
    if (fileExtension.length === 3) {
        // Is a valid extension
        return musicExtensions.indexOf(fileExtension) != -1;
    }

    return false;
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
    var tempURL = removeLastSlash(url);

    var tempPath = decodeURIComponent(tempURL);

    if (tempPath.indexOf('\\') > 0) {
        tempPath = tempPath.replace(/\\/g, '/');
    }

    tempURL = encodeURIComponent(tempPath);
    return settings.images.url + tempURL;
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
                if (urlFromXbmc.indexOf('image://') === 0) {
                    var tempURL = urlFromXbmc.substring('image://'.length);
                    if (tempURL.indexOf('http') === 0) {
                        imageUrl = decodeURIComponent(tempURL);
                    } else {

                        if (isMusicExtension(tempURL)) return callback();

                        imageUrl = buildImageUrl(tempURL);
                    }
                }

                imageUrl = removeLastSlash(imageUrl);

                var options = {
                    url: imageUrl,
                    encoding: 'binary'
                };

                console.log('Caching Image - Image URL: ' + options.url);

                if (attrs.newCache) {

                    var width = predefinedWidths[attrs.src];
                      //Save images in cache server
                    var imageId = url.parse(imageUrl).pathname;
                    var uploadUrl = settings.cache.url + "/upload?source=" + imageUrl + "&widths=" + width;
                   
                    request(uploadUrl, function(err,res,body){
                        if (res.statusCode !== 200){
                            console.log('Uploading image Failed');
                            return callback(); 
                        } 
                        self[attrs.dest] = settings.cache.url + "/static" + imageId;
                        console.log('Image uploaded succesfully. url: ' + self[attrs.dest]);
                        callback();
                    });  
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