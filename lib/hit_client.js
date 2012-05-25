var net = require('net');
var events = require('events');
var util = require('util');

module.exports = HitClient;

function HitClient(options) {
  this.options = options || {};
  this.options.reconnect || (this.options.reconnect = 1000);
  
  this.connected = false;
  this.disconnecting = false;
}

util.inherits(HitClient, events.EventEmitter);

HitClient.prototype.connect = function() {
  var self = this;
  var buffer = '';
  var port = this.options.port;
  var hostname = this.options.hostname;
  
  var reconnect = function() {
    if (self.options.reconnect) {
      setTimeout(function() {
        self.connect();
      }, self.options.reconnect)
    }
  };
  
  this.socket = net.createConnection(port, hostname, function() {
    self.connected = true;
    self.emit('connect');
  });
  
  this.socket.on('data', function(data) {
    buffer += data;
    var lines = buffer.split('\n');
    buffer = lines.pop();
    
    lines.forEach(function(line) {
      var message = parseMessage(line);
      
      if (message) {
        self.emit('message', message);
      }
    });
  });
  
  this.socket.on('end', function() {
    self.connected = false
    
    if (self.disconnecting) {
      self.disconnecting = false;
    } else {
      reconnect();
    }
  });
  
  this.socket.on('close', function() {
    self.connected = false;
    reconnect();
  });
  
  this.socket.on('error', function(err) {
    self.connected = false;
    self.emit('error', err.message);
  });
};

HitClient.prototype.disconnect = function() {
  this.disconnecting = true;
  this.socket.end();
};

HitClient.prototype.send = function() {
  var args = [].slice.call(arguments);
  var command = args.join(' ') + '!END!';
  
  if (this.connected) {
    this.socket.write(command);
  }
};

// Helpers
// ---------------

function parseMessage(data) {
  data = data.toString().split(':');
  
  if (data.length < 2) return;
  
  var id = data[0].split(' ').pop();
  var bytes = data[1].match(/\w+/g);
  var value = parseInt(bytes.join(''), 16);
  
  return { id: id, value: value };
}