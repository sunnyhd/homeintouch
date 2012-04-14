var fs = require("fs")

  , express = require("express")
  , socket = require("socket.io")
  , dirty = require("dirty")

  , config = require("./lib/config")

  , app = express.createServer()
  , io = socket.listen(app)
  , db = dirty("./data/homes.db")

  , eib = require("./lib/eib")
  , settings = require("./data/settings")

  , credentials = settings.credentials
  , hosts = settings.hosts

process.on("uncaughtException", function(err) {
  console.log("Caught exception", err)
})

app.use(express.basicAuth(credentials.username, credentials.password))
app.use(express.static(__dirname + "/public/"))

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', function(req, res){
  res.render('index');
});

app.listen(hosts.web.port, function() {
  console.log("now listening on %s...", hosts.web.port)
})

io.set("log level", 2)
io.sockets.on("connection", function (socket) {
  config.loadDeviceTypes(function(err, deviceTypes) {
    err
      ? socket.emit("error", err)
      : socket.emit("deviceTypes", deviceTypes)
  })

  config.loadHomes(function(err, homes) {
    err
      ? socket.emit("error", err)
      : socket.emit("homes", homes)
  })

  // send all keys, to eventually replace fs above
  var keys = {}

  db.forEach(function(key, value) {
    keys[key] = value
  })

  socket.emit("keys", keys)

  socket.on("setKey", function(key, value) {
    db.set(key, value)
  })

  socket.on("getKey", function(key) {
    socket.emit("key", key, db.get(key))
  })

  socket.on("deleteKey", function(key) {
    db.rm(key)
  })

  socket.on("set", eib.set)
  socket.on("get", eib.get)

  socket.on("save", function(home) {
    console.log("saving home %s", home.id);
    config.saveHome(home, function(err) {
      if (err) socket.emit("error", err)
    })
  })
})

if (process.argv[2] == "--clientonly") return

eib.connect()

eib.on("address", function(id, value) {
  console.log("%s is now %s", id, value)
  io.sockets.emit("address", id, value)
})
