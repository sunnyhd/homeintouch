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
    var start = parseInt(req.query.start, 10);
    var end = parseInt(req.query.end, 10);

    if (start === undefined || end === undefined) {
      return next(new Error('Must provide start and end'));
    }

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
    var params = { playerid: playerid };

    xbmc.rpc('Player.GetItem', params, function(err, results) {
      if (err) return next(err);

      params.properties = ['time', 'percentage', 'totaltime', 'repeat', 'shuffled', 'playlistid'];

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