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

module.exports = {
  loadHomes: loadHomes
}
