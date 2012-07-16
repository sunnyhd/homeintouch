var async = require('async');
var EventEmitter = require('events').EventEmitter;
var xbmc = require('./xbmc');
var Album = require('./models/album');
var Artist = require('./models/artist');
var Movie = require('./models/movie');
var Song = require('./models/song');

var importers = {
    movies: {
        model: Movie,
        method: 'VideoLibrary.GetMovies',
        params: {
            properties: [
                'thumbnail', 'genre', 'mpaa', 'rating', 'runtime',
                'year', 'file', 'studio', 'director', 'plot', 'votes',
                'fanart', 'imdbnumber', 'trailer'
            ]
        }
    },

    artists: {
        model: Artist,
        method: 'AudioLibrary.GetArtists',
        params: {
            properties: ['genre', 'description', 'thumbnail', 'fanart']
        }
    },

    albums: {
        model: Album,
        method: 'AudioLibrary.GetAlbums',
        params: {
            properties: ['artist', 'artistid']
        }
    },

    songs: {
        model: Song,
        method: 'AudioLibrary.GetSongs',
        params: {
            properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid']
        }
    }
};

var importer = module.exports = new EventEmitter();

importer.state = 'idle';

importer.start = function() {
    if (importer.state !== 'idle') return;
    
    var imports = {};
    var started = Date.now();

    for (var key in importers) {
        (function(key) {
            var importer = importers[key];

            imports[key] = function(callback) {
                // Remove all cached items
                importer.model.find().remove(function(err) {
                    if (err) return callback(err);

                    // Fetch items from XBMC
                    xbmc.rpc(importer.method, importer.params, function(err, results) {
                        if (err) return callback(err);

                        // Save items in cache
                        var queue = async.queue(function(attrs, callback) {
                            var instance = new importer.model(attrs);
                            instance.save(callback);
                        }, 2);

                        queue.drain = callback;
                        queue.push(results[key]);
                    });
                });
            };
        })(key);
    }

    importer.state = 'running';

    async.parallel(imports, function(err) {
        if (err) {
            importer.state = 'idle';
            return importer.emit('error', err);
        }

        importer.emit('done', Date.now() - started);
        importer.state = 'idle';
    });
};