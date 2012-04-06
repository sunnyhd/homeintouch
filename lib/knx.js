var net = require("net")
  , events = require("events")
  , config = require("./config")

  , read
  , write

  , knx = new events.EventEmitter

function connectRead() {
  console.log("connecting to knx/read...")
  read = net.connect(
    config.hosts.knx_read.port,
    config.hosts.knx_read.hostname
  )

  read.on("connect", function() {
    console.log("connected to knx/read.")
  })

  read.on("data", function(data) {
    parseStatus(data).forEach(function(message) {
      if (!message || message.type != "bc") return

      var data = parseBc(message.data)

      if (!data) return null

      knx.emit("address", {
        type: "knx",
        id: data.address,
        name: data.name,
        value: data.value
      })
    })
  })

  read.on("close", function() {
    console.log("knx read closed. reconnecting in 2s...")
    setTimeout(connectRead, 2000)
  })
}

function connectWrite() {
  console.log("connecting to knx/write...")

  write = net.connect(
    config.hosts.knx_write.port,
    config.hosts.knx_write.hostname
  )

  write.on("connect", function() {
    console.log("connected to knx/write.")
  })

  write.on("close", function() {
    console.log("knx write closed.")
    connectWrite()
  })
}

knx.get = function(address) {
  console.log("getting %s on knx", address)

  write.write(
    "<KNX>" +
      "<GETVALUE=" + address + ">" +
    "</KNX>"
  )
}

knx.set = function(address, value) {
  console.log("setting %s to %s on knx", address, value)

  var payload = [address, value].join(",")

  write.write(
    "<KNX>" +
      "<SETVALUE=" + payload + ">" +
    "</KNX>"
  )
}

function parseStatus(buffer) {
  var pattern = /^(.+) - (\w+): (.+)$/
    , lines = buffer.toString().split("\n")

  return lines.map(function(line) {
    var parts = line.match(pattern)

    return !parts ? null :

    {
      type: parts[2],
      data: parts[3]
    }
  })
}

function parseBc(data) {
  data = data.match(/^<KNX>(.+)<\/KNX>$/)

  if (!data) return null

  data = data[1].match(/^<(\d\/\d\/\d)-(.+)=(.+)>$/)

  if (!data) return null

  data[2] = data[2].replace(/\\x(\w{2})/g, function(all, code) {
    return String.fromCharCode(parseInt(code, 16))
  })

  return !data ? null :

  {
    address: data[1],
    name: data[2],
    value: +data[3]
  }
}

connectRead()
connectWrite()

module.exports = knx
