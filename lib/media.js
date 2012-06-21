var xbmc = require('./xbmc');

exports.commands = {
  create: function(req, res, next) {
    xbmc.rpc(req.body.method, req.body.params || {}, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.movies = {
  index: function(req, res, next) {
    var start = parseInt(req.query.start, 10) || 0;
    var end = parseInt(req.query.end, 10) || 20;

    var params = {
      properties: ['thumbnail', 'genre', 'playcount', 'mpaa', 'rating', 'runtime', 'year', 'lastplayed', 'file'],
      limits: { start: start, end: end },
      sort: { order: 'ascending', method: 'label' }
    };

    xbmc.rpc('VideoLibrary.GetMovies', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  }
};

exports.artists = {
  index: function(req, res, next) {
    var start = parseInt(req.query.start, 10) || 0;
    var end = parseInt(req.query.end, 10) || 20;

    var params = {
      properties: [],
      limits: { start: start, end: end },
      sort: { order: 'ascending', method: 'label' }
    };

    xbmc.rpc('AudioLibrary.GetArtists', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  },

  show: function(req, res, next) {
    var artistid = parseInt(req.params.artist, 10);

    var params = {
      artistid: artistid,
      properties: []
    };

    xbmc.rpc('AudioLibrary.GetArtistDetails', params, function(err, results) {
      if (err) return next(err);

      var artist = results.artistdetails;

      xbmc.rpc('AudioLibrary.GetAlbums', { artistid: artistid }, function(err, results) {
        if (err) return next(err);

        artist.albums = results.albums;
        res.json(artist);
      });
    });
  }
};

exports.albums = {
  index: function(req, res, next) {
    var start = parseInt(req.query.start, 10) || 0;
    var end = parseInt(req.query.end, 10) || 20;

    var params = {
      properties: [],
      limits: { start: start, end: end },
      sort: { order: 'ascending', method: 'label' }
    };

    xbmc.rpc('AudioLibrary.GetAlbums', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
    });
  },

  show: function(req, res, next) {
    var albumid = parseInt(req.params.album, 10);

    var params = {
      albumid: albumid,
      properties: []
    };

    xbmc.rpc('AudioLibrary.GetAlbumDetails', params, function(err, results) {
      if (err) return next(err);

      var album = results.albumdetails;

      params = {
        albumid: albumid,
        properties: ['track', 'file']
      };

      xbmc.rpc('AudioLibrary.GetSongs', params, function(err, results) {
        if (err) return next(err);

        album.songs = results.songs;
        res.json(album);
      });
    });
  }
};

exports.songs = {
  index: function(req, res, next) {
    var start = parseInt(req.query.start, 10) || 0;
    var end = parseInt(req.query.end, 10) || 20;

    var params = {
      properties: ['track', 'file'],
      limits: { start: start, end: end },
      sort: { order: 'ascending', method: 'label' }
    };

    xbmc.rpc('AudioLibrary.GetSongs', params, function(err, results) {
      if (err) return next(err);
      res.json(results);
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
      item: req.body
    };
    
    xbmc.rpc('Playlist.Add', params, function(err, results) {
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