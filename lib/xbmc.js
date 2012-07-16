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
    if (obj.id === undefined && obj.error) {
      for (var id in callbacks) {
        var callback = callbacks[id];
        delete callbacks[id];

        callback(new Error(obj.error));
      }
    } else if (obj.id) {
      // Response
      var callback = callbacks[obj.id];
      if (!callback) return;
      
      if (obj.error) {
        callback(new Error(JSON.stringify(obj.error)));
      } else {
        callback(null, obj.result);
      }
      
      delete callbacks[obj.id];
    } else {
      // Notification
      xbmc.emit('notification', obj);
    }
  });

  parser.on('error', function(err) {
    xbmc.client.emit('error', err);
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