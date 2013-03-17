var async = require('async');
var EventEmitter = require('events').EventEmitter;
var xbmc = require('./xbmc');
var Album = require('../app/models/album');
var Artist = require('../app/models/artist');
var Episode = require('../app/models/episode');
var Movie = require('../app/models/movie');
var Song = require('../app/models/song');
var TVShow = require('../app/models/tvshow');
// var Season = require('../app/models/season');

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
                'fanart', 'imdbnumber', 'trailer', 'playcount', 'resume'
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
            properties: ['artist', 'artistid', "playcount", "genre", "rating", "thumbnail", "year", "mood", "style"]
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
    },

    tvshow: {
        model: TVShow,
        multiple: {
            method: 'VideoLibrary.GetTVShows',
            key: 'tvshows'
        },
        single: {
            method: 'VideoLibrary.GetTVShowDetails',
            key: 'tvshowdetails'
        },
        id: 'tvshowid',
        params: {
            properties: ['year', 'rating', 'thumbnail', 'genre', 'studio', 'plot', 'mpaa', 'votes', 'cast', 'premiered', 'fanart', 'art']
        },

        childModels: {
            season: {
                parentKey : 'tvshowid',
                model: Season,
                multiple: {
                    method: 'VideoLibrary.GetSeasons',
                    key: 'seasons'
                },
                single: {
                    method: 'VideoLibrary.GetSeasonDetails',
                    key: 'seasondetails'
                },
                id: 'season',
                params: {
                    tvshowid: -1,
                    properties: ['fanart', 'watchedepisodes', 'episode', 'season', 'tvshowid', 'showtitle', 'art', 'thumbnail']
                }
            }        
        }
    },

    episode: {
        model: Episode,
        multiple: {
            method: 'VideoLibrary.GetEpisodes',
            key: 'episodes'
        },
        single: {
            method: 'VideoLibrary.GetEpisodeDetails',
            key: 'episodedetails'
        },
        id: 'episodeid',
        params: {
            properties: ['plot', 'rating', 'episode', 'firstaired', 'playcount', 'thumbnail', 'resume', 'season', 'tvshowid', 'showtitle', 'file']
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
            var importParams = importers[key];

            var importModel = function (options) {

                if (options) {

                    var func = function(callback) {
                        // Fetch items from XBMC

                        var loadMultipleCallback = function(err, results) {
                            if (err) return callback(err);

                            var childModels = options.childModels; 
                            var modelList = results[options.multiple.key];

                            if (childModels) {

                                for (var childKey in childModels) {

                                    var childModel = childModels[childKey];

                                    if (!modelList) return;

                                    for (var i = modelList.length - 1; i >= 0; i--) {
                                        var parentModel = modelList[i];
                                        var parentKey = childModel.parentKey;
                                        childModel.params[parentKey] = parentModel[parentKey];

                                        xbmc.rpc(childModel.multiple.method, childModel.params, 
                                            function (err, results) {
                                                if (err) return callback(err);

                                                var innerModelList = results[childModel.multiple.key];

                                                for (var j = innerModelList.length - 1; j >= 0; j--) {
                                                    var innerModel = innerModelList[j];
                                                    var query = {};
                                                    query[childModel.id] = innerModel[childModel.id];
                                                    query[childModel.parentKey] = innerModel[childModel.parentKey];

                                                    // Remove existing cached item
                                                    childModel.model.remove(query, function(err) {
                                                        if (err) return callback(err);

                                                    });

                                                    // Save item in cache
                                                    var instance = new childModel.model(innerModel);
                                                    instance.save(callback);
                                                }
                                            });
                                    }
                                    
                                }
                            }

                            var queue = async.queue(function(attrs, callback) {
                                var query = {};
                                query[options.id] = attrs[options.id];

                                // Remove existing cached item
                                options.model.remove(query, function(err) {
                                    if (err) return callback(err);

                                    // Save item in cache
                                    var instance = new options.model(attrs);
                                    instance.save(callback);
                                });
                            }, 2);

                            queue.drain = callback;
                            queue.push(modelList);
                        };

                        xbmc.rpc(options.multiple.method, options.params, loadMultipleCallback);
                    };

                    funcs.push(func);
                }
            };

            importModel(importParams);
            
        })(key);
    }

    importer.state = 'running';

    var asyncCallback = function(err) {
        if (err) {
            importer.state = 'idle';
            return importer.emit('error', err);
        }

        importer.emit('done', Date.now() - started);
        importer.state = 'idle';
    };

    async.parallel(funcs, asyncCallback);
};

importer.load = function(type, id, callback) {
    callback || (callback = function() {});

    var options = importers[type];
    if (!options) return callback();

    var params = { properties: options.params.properties };
    params[options.id] = id;

    xbmc.rpc(options.single.method, params, function(err, results) {
        if (err) return callback(err);

        // Remove existing cached item
        importer.remove(type, id, function(err) {
            if (err) return callback(err);

            // Save item in cache
            var instance = new options.model(results[options.single.key]);
            instance.save(callback);
        });
    });
};

importer.remove = function(type, id, callback) {
    var options = importers[type];
    if (!options) return callback();

    var query = {};
    query[options.id] = id;

    options.model.remove(query, callback);
};

importer.notification = function(data) {
    var methods = {
        'VideoLibrary.OnUpdate': 'load',
        'AudioLibrary.OnUpdate': 'load',
        'VideoLibrary.OnRemove': 'remove',
        'AudioLibrary.OnRemove': 'remove'
    };

    var op = methods[data.method];

    if (op) {
        var type = data.params.data.item.type;
        var id = data.params.data.item.id;
        importer[op].call(importer, type, id);
    }
};