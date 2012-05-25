var events = require('events');
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../data/settings');

var address = settings.hosts.hit;
var eib = module.exports = new events.EventEmitter();

eib.client = new HitClient({
  hostname: address.hostname,
  port: address.port,
  parse: parse
});

eib.connect = function() {
  eib.client.connect();
  
  eib.client.on('connect', function() {
    eib.client.send('hitbot_send', 'eibd', 'groupsocketlisten');
    setTimeout(function() {
      eib.client.send('hitbot_listen', 'eibd');
    }, 1000);
  });
  
  eib.client.on('message', function(message) {
    eib.emit('address', message.id, message.value);
  });
  
  eib.client.on('error', function(err) {
    console.log('eib error: %s', err);
  });
};

eib.get = function(address) {
  console.log('getting %s on eib', address);
  eib.client.send('hitbot_send', 'eibd', 'groupread', address);
};

eib.set = function(address, value) {
  console.log('setting %s to %s on eib', address, value);
  
  value = Number(value);

  if (value < 2) {
    eib.client.send('hitbot_send', 'eibd', 'groupswrite', address, value);
  } else {
    value = value.toString(16).match(/..$|./g);
    eib.client.send('hitbot_send', 'eibd', 'groupwrite', address, value);
  }
};

// Helpers
// ---------------

function parse(data) {
  data = data.toString().split(':');

  if (data.length < 2) return;

  var id = data[0].split(' ').pop();
  var bytes = data[1].match(/\w+/g);
  var value = parseInt(bytes.join(''), 16);

  return { id: id, value: value };
}