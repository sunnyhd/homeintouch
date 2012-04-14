var child_process = require("child_process")
  , spawn = child_process.spawn
  , events = require("events")

  , eib = new events.EventEmitter
  , child

eib.connect = function() {
  child = spawn("groupsocketlisten", ["ip:localhost"])

  child.stderr.on("data", function(e) {
    console.log("eib error: %s", e)
  })

  child.stdout.on("data", function(data) {
    data = data.toString().split(":")

    var id = data[0].split(" ").pop()
      , bytes = data[1].match(/\w+/g)
      , value = parseInt(bytes.join(""), 16)

    if (bytes.length == 2) value /= 100

    eib.emit("address", id, value)
  })

  child.on("exit", function (code) {
    if (code !== 0) {
      console.log("eib process exited with code " + code)
    }
  })
}

eib.get = function(address) {
  console.log("getting %s on eib", address)

  spawn("groupread", ["ip:localhost", address])
}

eib.set = function(address, value) {
  console.log("setting %s to %s on eib", address, value)

  var command = value.constructor == Boolean
    ? "groupswrite"
    : "groupwrite"

  value = Number(value).toString(16)

  spawn(command, ["ip:localhost", address, value])
}

module.exports = eib
