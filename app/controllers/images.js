var images = require('../../lib/images');
var Promise = require('../../lib/promise');
var request = require('request');
var fs = require('fs');
var svgImageCache = {};
var imageCache = require('../../lib/image_cache');

var settings = require('../../config');

exports.show = function(req, res, next) {
    images.get(req.params.image, function(err, buffer) {
        if (err) return next(err);
        res.end(buffer.toString(), 'binary');
    });
};

exports.create = function(req, res) {
  	images.put(new Buffer(req.body.fileStream), function(err, doc) {
      	res.writeHead(200, { 'Content-Type': 'application/json' });
    		res.end(JSON.stringify({
        		success: true,
        		imagePath: 'api/images/' + doc._id
    		}));
  	});
};

exports.svgGet = function(req, res, next) {
    var color = req.params.color.replace(/0x/g, '#');
    var imgPath = req.params.image.replace(/-/g, '/');
    imgPath = './public/img/svg/' + imgPath;
    var cacheKey = imgPath + '/' + color;

    console.log('color: ' + color + ' - imgPath: ' + imgPath);

    if (svgImageCache[cacheKey]) {
        console.log('Image cached');
        res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
        res.end(svgImageCache[cacheKey], 'binary');
    } else {
        fs.readFile(imgPath, function(err, data) {
            if (err) return next(err);
            var result = data.toString().replace(/#000000/g, color);
            
            svgImageCache[cacheKey] = result;

            res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
            res.end(result, 'binary');
        });
    }
};

exports.getFromCache = function(req, res, next) {
    var imageId = req.path.substring(settings.cache.localUrl.length);

    imageCache.loadAndPipe(imageId).pipe(res);
}

exports.getFromXbmc = function(req, res, next) {
    var imageId = req.path.substring(settings.cache.xbmcRoute.length);

    var loadPromise = imageCache.loadFromXBMCAndPipe(imageId);

    loadPromise.then(function(response) {
        if (response.statusCode !== 200) {
            console.log('Error retrieving XBMC thumbnail');
            res.send('Sorry, we cannot find that!', 404);
        } else {
            request.get(imageURL).pipe(res);
        }
    }).fail(function(){
        console.log('Error retrieving XBMC thumbnail');
        res.send('Sorry, we cannot find that!', 404);
    });
}