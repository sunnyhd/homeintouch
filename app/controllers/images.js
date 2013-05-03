var images = require('../../lib/images');
var fs = require('fs');
var svgImageCache = {};

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


}