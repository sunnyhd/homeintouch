var xbmc = require('./xbmc');

exports.movies = {
  index: function(req, res, next) {
    var params = {
      properties: ['thumbnail', 'genre', 'playcount', 'mpaa', 'rating', 'runtime', 'year', 'lastplayed']
    };

    xbmc.rpc('VideoLibrary.GetMovies', params, function(err, results) {
      if (err) return next(err);
      res.json(results.movies);
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
      res.json(results.items);
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
      res.json(results.items);
    });
  }
};