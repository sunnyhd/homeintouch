var express = require('express');
var socket = require('socket.io');
var settings = require('./data/settings');
var dataStore = require('./lib/datastore');
var eib = require('./lib/eib');
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
  app.use(express.static(__dirname + "/public/"));

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

io.set("log level", 2);

// Routes
// ---------------

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/api/movies', media.movies.index);
app.get('/api/playlists', media.playlists.index);
app.get('/api/playlists/:playlist/items', media.playlistitems.index);
app.post('/api/playlists/:playlist/items', media.playlistitems.create);

// Notifications
// ---------------

io.sockets.on("connection", function (socket) {

  socket.emit("keys", dataStore.getAll());

  socket.on("setKey", dataStore.set);

  socket.on("getKey", function(key) {
    socket.emit("key", key, dataStore.get(key));
  });

  socket.on("deleteKey", function(key) {
    dataStore.rm(key);
  });

  socket.on("set", eib.set);
  socket.on("get", eib.get);
});

eib.on("address", function(id, value) {
  console.log("%s is now %s", id, value);
  io.sockets.emit("address", id, value);
});

// Bootstrap
// ---------------

dataStore.init(settings.database.path);
eib.connect()
xbmc.connect()

app.listen(hosts.web.port, function() {
  console.log("now listening on %s...", hosts.web.port);
});