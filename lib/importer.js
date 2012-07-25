var async = require('async');
var EventEmitter = require('events').EventEmitter;
var xbmc = require('./xbmc');
var Album = require('../app/models/album');
var Artist = require('../app/models/artist');
var Movie = require('../app/models/movie');
var Song = require('../app/models/song');

var importers = {
    movie: {
        model: Movie,
        multiple: {
            method: 'VideoLibrary.GetMovies',
            key: 'movies'
        },
        single: {
            method: 'VideoLibrary.GetMovieDetails',
            key: 'moviedetails'
        },
        id: 'movieid',
        params: {
            properties: [
                'thumbnail', 'genre', 'mpaa', 'rating', 'runtime',
                'year', 'file', 'studio', 'director', 'plot', 'votes',
                'fanart', 'imdbnumber', 'trailer'
            ]
        }
    },

    artist: {
        model: Artist,
        multiple: {
            method: 'AudioLibrary.GetArtists',
            key: 'artists'
        },
        single: {
            method: 'AudioLibrary.GetArtistDetails',
            key: 'artistdetails'
        },
        id: 'artistid',
        params: {
            properties: ['genre', 'description', 'thumbnail', 'fanart']
        }
    },

    album: {
        model: Album,
        multiple: {
            method: 'AudioLibrary.GetAlbums',
            key: 'albums'
        },
        single: {
            method: 'AudioLibrary.GetAlbumDetails',
            key: 'albumdetails'
        },
        id: 'albumid',
        params: {
            properties: ['artist', 'artistid']
        }
    },

    song: {
        model: Song,
        multiple: {
            method: 'AudioLibrary.GetSongs',
            key: 'songs'
        },
        single: {
            method: 'AudioLibrary.GetSongDetails',
            key: 'songdetails'
        },
        id: 'songid',
        params: {
            properties: ['track', 'file', 'artist', 'artistid', 'album', 'albumid']
        }
    }
};

var importer = module.exports = new EventEmitter();

importer.state = 'idle';

importer.start = function() {
    if (importer.state !== 'idle') return;
    
    var funcs = [];
    var started = Date.now();

    for (var key in importers) {
        (function(key) {
            var importer = importers[key];

            var func = function(callback) {
                // Fetch items from XBMC
                xbmc.rpc(importer.multiple.method, importer.params, function(err, results) {
                    if (err) return callback(err);

                    var queue = async.queue(function(attrs, callback) {
                        var query = {};
                        query[importer.id] = attrs[importer.id];

                        // Remove existing cached item
                        importer.model.remove(query, function(err) {
                            if (err) return callback(err);

                            // Save item in cache
                            var instance = new importer.model(attrs);
                            instance.save(callback);
                        });
                    }, 2);

                    queue.drain = callback;
                    queue.push(results[importer.multiple.key]);
                });
            };

            funcs.push(func);
        })(key);
    }

    importer.state = 'running';

    async.parallel(funcs, function(err) {
        if (err) {
            importer.state = 'idle';
            return importer.emit('error', err);
        }

        importer.emit('done', Date.now() - started);
        importer.state = 'idle';
    });
};

importer.load = function(type, id, callback) {
    callback || (callback = function() {});

    var importer = importers[type];
    var params = { properties: importer.params.properties };
    params[importer.id] = id;

    xbmc.rpc(importer.single.method, params, function(err, results) {
        if (err) return callback(err);

        var query = {};
        query[importer.id] = id;

        // Remove existing cached item
        importer.model.remove(query, function(err) {
            if (err) return callback(err);

            // Save item in cache
            var instance = new importer.model(results[importer.single.key]);
            instance.save(callback);
        });
    });
};

importer.notification = function(data) {
    var methods = ['VideoLibrary.OnUpdate', 'AudioLibrary.OnUpdate'];

    if (methods.indexOf(data.method) >= 0) {
        var type = data.params.data.item.type;
        var id = data.params.data.item.id;
        importer.load(type, id);
    }
};