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
        params.directory = directory;

        xbmc.rpc('Files.GetDirectory', params, function(err, results) {
            if (err) return next(err);
            res.json(results.files);
        })
    } else {
        xbmc.rpc('Files.GetSources', params, function(err, results) {
            if (err) return next(err);

            var sources = results.sources;

            sources.forEach(function(source) {
                source.filetype = 'directory';
                source.type = 'unknown';
            });

            res.json(sources);
        });
    }
};