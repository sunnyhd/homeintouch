var dirty = require('dirty');

var db;
var data = {};
var dataStore = module.exports = {};

dataStore.init = function(dbPath){
  db = dirty(dbPath);

  db.on('load', function(){
    db.forEach(function(key, value) {
      data[key] = value;
    });
  });

  return data;
};

dataStore.getAll = function(){
  return parse(data);
};

dataStore.get = function(key){
  return data[key];
};

dataStore.set = function(key, value){
  data[key] = value;
  db.set(key, value);
};

dataStore.rm = function(key){
  delete data[key];
  db.rm(key);
};

// Helpers
// ---------------

function parse(raw) {
  var data = {};
  
  for (var key in raw) {
    if (raw.hasOwnProperty(key)) {
      var segments = key.split('/');
      var type = segments[0];
      var value = raw[key];
      
      data[type] || (data[type] = []);
      data[type].push(value);
    }
  }

  return data;
}