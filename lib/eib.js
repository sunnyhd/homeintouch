var events = require('events');
var net = require('net');
var settings = require('../data/settings');

var eib = new events.EventEmitter();
var address = settings.hosts.hit;

var send = function(tokens) {
  var command = tokens.join(' ') + '!END!';
  eib.client.write(command);
};

eib.connect = function(callback) {
  eib.client = net.connect(address.port, address.host);
  
  send(['hitbot_send', 'eibd', 'groupsocketlisten']);
  setTimeout(function() {
    send(['hitbot_listen', 'eibd']);
  }, 1000);
  
  eib.client.on('data', function(data) {
    data = data.toString().split(':');
    
    if (data.length < 2) return;
    
    var id = data[0].split(' ').pop();
    var bytes = data[1].match(/\w+/g);
    var value = parseInt(bytes.join(''), 16);

    eib.emit('address', id, value);
  });
  
  eib.client.on('error', function(err) {
    console.log('eib error: %s', err.message);
  });
};

eib.get = function(address) {
  console.log('getting %s on eib', address);
  
  send(['hitbot_send', 'eibd', 'groupread', address]);
};

eib.set = function(address, value) {
  value = Number(value);

  console.log('setting %s to %s on eib', address, value);
  
  var command = ['hitbot_send', 'eibd'];

  if (value < 2) {
    command.push('groupswrite');
  } else {
    value = value.toString(16).match(/..$|./g);
    command.push('groupwrite');
  }
  
  command.push(address);
  command.push(value);
  send(command);
};

module.exports = eib
