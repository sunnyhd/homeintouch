var carrier = require('carrier');
var net = require('net');
var events = require('events');
var util = require('util');

module.exports = HitClient;

function HitClient(options) {
  this.options = options || {};
  this.options.reconnect || (this.options.reconnect = 5000);
  this.options.delimiter || (this.options.delimiter = /\r?\n/);
  
  this.parse = this.options.parse || function(data) {
    return data.toString();
  };
  
  this.connected = false;
  this.disconnecting = false;
}

util.inherits(HitClient, events.EventEmitter);

HitClient.prototype.connect = function() {
  var self = this;
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
  
  if (this.options.delimiter !== false) {
    carrier.carry(this.socket, function(line) {
      var message = self.parse(line);
      
      if (message) {
        self.emit('message', message);
      }
    }, 'utf8', this.options.delimiter);
  }

  this.socket.on('data', function(data) {
    self.emit('data', data);
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

  console.log(command);
  
  if (this.connected) {
    this.socket.write(command);
  }
};