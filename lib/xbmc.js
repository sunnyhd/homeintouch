var EventEmitter = require('events').EventEmitter;
var jsonsp = require('jsonsp');
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../data/settings');

var xbmc = module.exports = new EventEmitter();
var parser = new jsonsp.Parser();

var address = settings.hosts.hit;
var callbacks = {};

xbmc.client = new HitClient({
  hostname: address.hostname,
  port: address.port,
  delimiter: false
});

xbmc.connect = function(callback) {
  xbmc.client.connect();
  
  xbmc.client.on('connect', function() {
    xbmc.client.send('hitbot_listen', 'xbmc');
    if (callback) callback();
  });

  xbmc.client.on('data', function(data) {
    parser.parse(data.toString('utf8'));
  });

  parser.on('object', function(obj) {
    xbmc.client.emit('message', obj);
  });
  
  xbmc.client.on('message', function(message) {
    if (message.id !== undefined) {
      // Response
      var callback = callbacks[message.id.toString()];
      if (!callback) return;
      
      if (message.error) {
        callback(message.error);
      } else {
        callback(null, message.result);
      }
      
      delete callbacks[message.id];
    } else {
      // Notification
      xbmc.emit('notification', message);
    }
  });
  
  xbmc.client.on('error', function(err) {
    console.log('xbmc error: %s', err);
    
    for (var id in callbacks) {
      var callback = callbacks[id];
      callback(err);
    }
    
    callbacks = {};
  });
};

xbmc.query = function(query, callback) {
  query.id = genId();
  callbacks[query.id] = callback;
  xbmc.client.send('hitbot_send', 'xbmc', JSON.stringify(query));
};

xbmc.rpc = function(method, params, callback) {
  if (callback === undefined) {
    callback = params;
    params = null;
  }
  
  var query = { jsonrpc: '2.0', method: method };
  if (params !== null) {
    query.params = params;
  }
  
  xbmc.query(query, callback);
};

// Helpers
// ---------------

var count = 1;

function genId() {
  return count++;
}