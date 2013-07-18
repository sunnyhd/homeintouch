var xbmc = require('../../lib/xbmc');
var crc = require('../../lib/crc');

var settings = require('../../config');

var THUMBNAIL_URL = 'special://profile/Thumbnails/';

exports.index = function(req, res, next) {
    var type = req.query.type;
    var directory = req.query.directory;

    if (!type) {
        return next(new Error('Must specify a type'));
    }

    var params = {
        media: type,
        sort: {
            ignorearticle: false,
            method: 'label',
            order: 'ascending'
        }
    };

    if (directory) {

        var urlPattern = /^(\/\w+\:\/{1,2}).*/;

        if (directory.match(urlPattern)) {
            directory = directory.substr(1);
        }

        params = {
            directory: directory,
            media: type
        };

        xbmc.rpc('Files.GetDirectory', params, function(err, results) {
            if (err) return next(err);

            var files = results.files;

            if (files) {
                files.forEach(function(file) {

                    var pathToHash = '';
                    var path = encodeURIComponent(file.file).toLowerCase();
                    
                    // Create the path to XBMC thumbnails using the CRC32 of the path
                    if (file.filetype === 'file') {
                        pathToHash = 'image://' + path + '/transform?size=thumb';
                    } else if (file.filetype === 'directory') {

                        pathToHash = 'image://picturefolder@' + path + '/';
                    }

                    var thumb = crc.generate(pathToHash); 
                    file.thumbnail = THUMBNAIL_URL + thumb.charAt(0) + '/' + thumb + ((file.filetype === 'file') ? '.jpg' : '.png');

                    file.encodedPath = settings.images.url + encodeURIComponent(file.file);

                    if (file.file.indexOf('\\') > 0) {
                        file.file = file.file.replace(/\\/g, '/');
                    }
                });
            }

            res.json(files);
		});
            /*var promises = [Promise.resolve(files)];

            if (files) {
                promises = files.map(function(file) {
                    console.log('Filename: ', file.file);
                    
                    var path = file.file;

                    if (path.indexOf('\\') > 0) {
                        path = path.replace(/\\/g, '/');
                    }

                    if(file.filetype === 'file') {
                        var thumb = crc.generate(file.file.toLowerCase()); 
                        file.thumbnail = THUMBNAIL_URL + thumb.charAt(0) + '/' + thumb + '.jpg';
                        /*file.file = path;
                        return imageCache.load('http://htpc:8010/image/' + encodeURIComponent(path))
                            .fail(function() {
                                return imageCache.save('http://htpc:8010/image/' + encodeURIComponent(path), 240)
                            })
                            .then(function() {
                                file.thumbnail = settings.cache.localUrl + path;
                                return true;
                            });
                    } else {
                        file.file = path;
                        
                    }
                    return Promise.resolve(true);
                    
                });
            }

            Promise.all(promises).then(function() {
                res.json(files);    
            }).fail(function(err) {
                console.log(err);
                throw err;
            }).done();
            */
        
    } else {
        xbmc.rpc('Files.GetSources', params, function(err, results) {
            if (err) return next(err);

            var sources = results.sources;

            if (sources) {
                sources.forEach(function(source) {
                    source.filetype = 'directory';
                    source.type = 'unknown';

                    console.log('Filename: ', source.file);
                    if (source.file.indexOf('\\') > 0) {
                        source.file = source.file.replace(/\\/g, '/');
                    }
                });
            }

            res.json(sources);
        });
    }
};