var fs = require("fs")

function loadHomes(cb) {
  var homes = []

  fs.readdir("./data/homes", function(err, names) {
    if (err) return console.error(err)

    names.forEach(function(name) {
      var suffix = name.slice(-5)
        , home

      if (suffix != ".json") return

      name = name.slice(0, -5)

      try {
        home = require("../data/homes/" + name)
        home.id = name
        homes.push(home)
      }

      catch (err) { console.error(err) }
    })

    cb(null, homes)
  })
}

function saveHome(home, cb) {
  var json = JSON.stringify(home, null, 2)
    , filename = "./data/homes/" + home.id + ".json"

  if (!home.id) return cb(new Error("Home needs to have an .id specified."))

  fs.writeFile(filename, json, cb)
}

function loadDeviceTypes(cb){
  fs.readFile("./data/device_types.json", function(err, buffer){
    var deviceTypes = JSON.parse(buffer);
    cb(err, deviceTypes)
  });
}

module.exports = {
  loadHomes: loadHomes,
  saveHome: saveHome,
  loadDeviceTypes: loadDeviceTypes
}
