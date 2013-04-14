var xbmc = require('../../lib/xbmc');

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

        if (directory.match(/\/\w\:\/.*/)) {
            console.log('Windows directory: ' + directory);
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
                    console.log('Filename: ', file.file);
                    if (file.file.indexOf('\\') > 0) {
                        file.file = file.file.replace(/\\/g, '/');
                    }
                });
            }

            res.json(files);
        })
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