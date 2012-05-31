var express = require("express")
  , socket = require("socket.io")

  , dataStore = require("./lib/dataStore")

  , app = express.createServer()
  , io = socket.listen(app)
  , eib = require("./lib/eib")
  , xbmc = require("./lib/xbmc")
  , media = require('./lib/media')
  , settings = require("./data/settings")

  , credentials = settings.credentials
  , hosts = settings.hosts

process.on("uncaughtException", function(err) {
  console.log("Caught exception", err, err.stack)
})

// Initialize the datastore
dataStore.init(settings.database.path);

app.use(express.basicAuth(credentials.username, credentials.password))
app.use(express.bodyParser())
app.use(express.static(__dirname + "/public/"))

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
  res.render('index');
});

app.get('/api/movies', media.movies.index);
app.get('/api/playlists', media.playlists.index);
app.get('/api/playlists/:playlist/items', media.playlistitems.index);
app.post('/api/playlists/:playlist/items', media.playlistitems.create);

app.listen(hosts.web.port, function() {
  console.log("now listening on %s...", hosts.web.port)
})

io.set("log level", 2)
io.sockets.on("connection", function (socket) {

  socket.emit("keys", dataStore.getAll());

  socket.on("setKey", dataStore.set)

  socket.on("getKey", function(key) {
    socket.emit("key", key, dataStore.get(key))
  })

  socket.on("deleteKey", function(key) {
    dataStore.rm(key)
  })

  socket.on("set", eib.set)
  socket.on("get", eib.get)
})

eib.connect()
xbmc.connect()

eib.on("address", function(id, value) {
  console.log("%s is now %s", id, value)
  io.sockets.emit("address", id, value)
})
