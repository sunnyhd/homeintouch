var dirty = require("dirty");

var db;
var data = {};
var dataStore = {};

dataStore.init = function(dbPath){
  db = dirty(dbPath);

  db.on("load", function(){
    db.forEach(function(key, value) {
      data[key] = value;
    });
  });

}

dataStore.getAll = function(){
  return data;
}

dataStore.get = function(key){
  return data[key];
}

dataStore.set = function(key, value){
  data[key] = value;
  db.set(key, value);
}

dataStore.rm = function(key){
  db.rm(key);
}

module.exports = dataStore;
