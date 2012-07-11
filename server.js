var async = require('async');
var express = require('express');
var mongoose = require('mongoose');
var nettle = require('nettle');
var socket = require('socket.io');
var settings = require('./data/settings');
var client = require('./lib/client');
var dataStore = require('./lib/dataStore');
var eib = require('./lib/eib');
var importer = require('./lib/importer');
var media = require('./lib/media')
var xbmc = require('./lib/xbmc');

var credentials = settings.credentials;
var hosts = settings.hosts;

var app = express.createServer();
var io = socket.listen(app);

// Config
// ---------------

app.configure(function() {
  app.use(express.basicAuth(credentials.username, credentials.password));
  app.use(express.bodyParser());

  app.get('/application.js', client.assets.createServer());
  app.use(express.static(__dirname + '/public/'));

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

io.set('log level', 2);

// Routes
// ---------------

app.get('/', function(req, res, next) {
  var funcs = {
    players: function(callback) {
      xbmc.rpc('Playlist.GetPlaylists', function(err, results) {
        if (err) return callback(err);
        var players = {};

        results.forEach(function(playlist) {
          players[playlist.type] = playlist.playlistid;
        });

        callback(null, players);
      });
    }
  };

  async.parallel(funcs, function(err, results) {
    if (err) return next(err);

    res.render('index', {
      data: dataStore.getAll(),
      players: results.players
    });
  });
});

app.put('/api/homes/:home', function(req, res) {
  dataStore.set('homes/' + req.params.home, req.body);
  res.json(req.body);
});

app.del('/api/homes/:home', function(req, res) {
  dataStore.rm('homes/' + req.params.home);
  res.send(204);
});

app.post('/api/commands', media.commands.create);
app.get('/api/volume', media.volume.show);
app.get('/api/movies', media.movies.index);
app.get('/api/movies/:movie', media.movies.show);
app.get('/api/artists', media.artists.index);
app.get('/api/artists/:artist', media.artists.show);
app.get('/api/albums', media.albums.index);
app.get('/api/albums/:album', media.albums.show);
app.get('/api/songs', media.songs.index);
app.get('/api/playlists', media.playlists.index);
app.get('/api/playlists/:playlist/items', media.playlistitems.index);
app.post('/api/playlists/:playlist/items', media.playlistitems.create);
app.del('/api/playlists/:playlist/items/:index', media.playlistitems.destroy);
app.post('/api/player', media.player.create);
app.get('/api/players', media.players.index);
app.get('/api/players/:player', media.players.show);
app.del('/api/players/:player', media.players.destroy);
app.post('/api/imports', media.imports.create);

// Notifications
// ---------------

io.sockets.on('connection', function (socket) {
  socket.on('eib:set', eib.set);
  socket.on('eib:get', eib.get);
});

eib.on('address', function(id, value) {
  console.log('eib:address', id, value);
  io.sockets.emit('eib:address', id, value);
});

xbmc.on('notification', function(data) {
  console.log('xbmc:notification', JSON.stringify(data));
  io.sockets.emit('xbmc:notification', data);
});

importer.on('done', function(time) {
  console.log('importer:done', time);
  io.sockets.emit('importer:done', time);
});

importer.on('error', function(err) {
  console.log('imporer:error', err);
  io.sockets.emit('importer:error', err.message);
});

// Bootstrap
// ---------------

dataStore.init(settings.database.path);
mongoose.connect(settings.database.mongodb);
eib.connect();
xbmc.connect();

app.listen(hosts.web.port, function() {
  console.log('now listening on %s...', hosts.web.port);
});