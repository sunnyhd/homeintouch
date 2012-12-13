var images = require('../../lib/images');
var fs = require('fs');

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
    console.log('Image path: ' + req.params.image);

    var imagePath = req.params.image.replace(/\./g, '/');
    imagePath = './public/img/svg/' + imagePath + '.svg';

    console.log('Full Image Path: ' + imagePath);

    fs.readFile(imagePath, function(err, data) {
        if (err) return next(err);
        var result = data.toString().replace(/#000000/g, req.query.color);
        res.end(result, 'binary');
    });
}