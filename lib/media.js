var images = require('./images');
var importer = require('./importer');
var xbmc = require('./xbmc');
var Album = require('./models/album');
var Artist = require('./models/artist');
var Movie = require('./models/movie');
var Song = require('./models/song');

exports.imports = {
  create: function(req, res, next) {
    importer.start();
    res.send('OK');
  }
};

exports.images = {
  show: function(req, res, next) {
    images.get(req.params.image, function(err, buffer) {
      if (err) return next(err);
      res.end(buffer.toString(), 'binary');
    });
  }
};

exports.commands = {
  create: function(req, res, next) {
    xbmc.rpc(req.body.method, req.body.params || {}, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.volume = {
  show: function(req, res, next) {
    var params = {
      properties: ['muted', 'volume']
    };

    xbmc.rpc('Application.GetProperties', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.movies = {
  index: function(req, res, next) {
    Movie.find(function(err, movies) {
      if (err) return next(err);
      res.json(movies);
    });
  },

  show: function(req, res, next) {
    Movie.findOne({ movieid: req.params.movie }, function(err, movie) {
      if (err) return next(err);
      if (!movie) return next(new Error('No such movie'));

      var params = {
        movieid: parseInt(req.params.movie, 10),
        properties: ['playcount', 'resume']
      };

      xbmc.rpc('VideoLibrary.GetMovieDetails', params, function(err, results) {
        if (err) return next(err);

        movie = movie.toObject();
        movie.playcount = results.moviedetails.playcount;
        movie.resume = results.moviedetails.resume;

        res.json(movie);
      });
    });
  }
};

exports.artists = {
  index: function(req, res, next) {
    Artist.find(function(err, artists) {
      if (err) return next(err);
      res.json(artists);
    });
  },

  show: function(req, res, next) {
    Artist.findOne({ artistid: req.params.artist }, function(err, artist) {
      if (err) return next(err);
      if (!artist) return next(new Error('No such artist'));

      Album.find({ artistid: artist.artistid }, function(err, albums) {
        if (err) return next(err);

        artist = artist.toObject();
        artist.albums = albums;

        res.json(artist);
      });
    });
  }
};

exports.albums = {
  index: function(req, res, next) {
    Album.find(function(err, albums) {
      if (err) return next(err);
      res.json(albums);
    });
  },

  show: function(req, res, next) {
    Album.findOne({ albumid: req.params.album }, function(err, album) {
      if (err) return next(err);
      if (!album) return next(new Error('No such album'));

      Song.find({ albumid: album.albumid }, function(err, songs) {
        if (err) return next(err);

        album = album.toObject();
        album.songs = songs;

        res.json(album);
      });
    });
  }
};

exports.songs = {
  index: function(req, res, next) {
    Song.find(function(err, songs) {
      if (err) return next(err);
      res.json(songs);
    });
  }
};

exports.playlists = {
  index: function(req, res, next) {
    xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.playlistitems = {
  // List playlist items
  index: function(req, res, next) {
    var playlistid = parseInt(req.params.playlist, 10);
    
    xbmc.rpc('Playlist.GetItems', { playlistid: playlistid }, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  },
  
  // Add item to playlist
  create: function(req, res, next) {
    var params = {
      playlistid: parseInt(req.params.playlist, 10),
      item: req.body.item
    };

    var method = 'Playlist.Add';

    if (req.body.position !== undefined) {
      method = 'Playlist.Insert';
      params.position = req.body.position;
    }
    
    xbmc.rpc(method, params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  },

  destroy: function(req, res, next) {
    var params = {
      playlistid: parseInt(req.params.playlist, 10),
      position: parseInt(req.params.index, 10)
    };

    xbmc.rpc('Playlist.Remove', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.player = {
  create: function(req, res, next) {
    var params = req.body || {};

    xbmc.rpc('Player.Open', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.players = {
  index: function(req, res, next) {
    xbmc.rpc('Player.GetActivePlayers', {}, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  },

  show: function(req, res, next) {
    var playerid = parseInt(req.params.player, 10);
    var params = {
      playerid: playerid,
      properties: ['thumbnail']
    };

    xbmc.rpc('Player.GetItem', params, function(err, results) {
      if (err) return next(err);

      params.properties = ['time', 'percentage', 'totaltime', 'repeat', 'shuffled', 'playlistid', 'speed', 'type'];

      xbmc.rpc('Player.GetProperties', params, function(err, properties) {
        if (err) return next(err);

        results.playerid = playerid;
        for (var key in properties) {
          results[key] = properties[key];
        }

        res.json(results);
      })
    });
  },

  destroy: function(req, res, next) {
    var params = { playerid: parseInt(req.params.player, 10) };

    xbmc.rpc('Player.Stop', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};