var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../data/settings');

var address = settings.hosts.hit;
var queue = [];

var client = exports.client = new HitClient({
  hostname: address.hostname,
  port: address.port,
  delimiter: '!MSGEND!',
  parse: parse
});

exports.connect = function(callback) {
  client.connect();
  
  client.on('connect', function() {
    client.send('hitbot_listen', 'xbmc');
    if (callback) callback();
  });
  
  client.on('message', function(message) {
    var callback = queue.shift();
    
    if (message.error) {
      callback(message);
    } else {
      callback(null, message);
    }
  });
  
  client.on('error', function(err) {
    console.log('exports error: %s', err);
    
    queue.forEach(function(callback) {
      callback(err);
    });
    queue = [];
  });
};

exports.query = function(query, callback) {
  queue.push(callback);
  client.send('hitbot_send', 'xbmc', JSON.stringify(query));
};

// Helpers
// ---------------

function parse(data) {
  return JSON.parse(data.toString());
}