var fs = require("fs")

  , express = require("express")
  , socket = require("socket.io")

  , config = require("./lib/config")

  , app = express.createServer()
  , io = socket.listen(app)

  , eib = require("./lib/eib")
  , settings = require("./data/settings")

  , credentials = settings.credentials
  , hosts = settings.hosts


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
  config.loadHomes(function(err, homes) {
    err
      ? socket.emit("error", err)
      : socket.emit("homes", homes)
  })

  socket.on("set", eib.set)
  socket.on("get", eib.get)
})

if (process.argv[2] == "--clientonly") return

eib.connect()

eib.on("address", function(id, value) {
  console.log("%s is now %s", id, value)
  io.sockets.emit("address", id, value)
})
