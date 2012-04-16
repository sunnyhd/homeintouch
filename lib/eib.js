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
	// the following is parsed according to the EIBD spec here[1],
	// which says that the value format is XXXX XX00 00XX XXXX.
	// [1] https://github.com/downloads/jed/homeintouch/eibd.pdf
      , value = parseInt(bytes[0], 16) * 16 + parseInt(bytes[1], 16)

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
  var command = value.constructor == Boolean
    ? "groupswrite"
    : "groupwrite"

  value = Number(value).toString(16)

  console.log("setting %s to %s on eib", address, value)

  spawn(command, ["ip:localhost", address, value])
}

module.exports = eib
