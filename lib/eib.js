var events = require('events');
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../config');

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
    setTimeout(function() {
      eib.client.send('hitbot_listen', 'eibd');
    }, 1000);
  });
  
  eib.client.on('message', function(message) {
    eib.emit('address', message.id, message.value);
  });
  
  eib.client.on('error', function(err) {
    console.log('eib:error', err);
  });
};

eib.get = function(address) {
  console.log('eib:get', address);
  eib.client.send('hitbot_send', 'eibd', 'groupcachereadsync', address);
};

eib.set = function(address, value, dptType) {
  console.log('eib:set', address, value, dptType);

  var dptInitial = '';
  if (dptType !== '') {
    dptInitial = dptType.split('\.')[0];
  }

  value = Number(value);
  if (dptInitial === '1') {
    console.log('groupswrite');
    eib.client.send('hitbot_send', 'eibd', 'groupswrite', address, value);
  } else {
    value = value.toString(16).match(/..$|./g).join(' ');
    console.log('Split value: ', value);
    eib.client.send('hitbot_send', 'eibd', 'groupwrite', address, value);
  }
};

eib.commandSend = function(value) {
  console.log('eib:commandSend', value);
  eib.client.send('hitbot_send', value);
};

// Helpers
// ---------------

function parse(data) {
  data = data.toString().split(':');

  if (data.length < 2) return;

  var id = data[0].split(' ').pop();
  var bytes = data[1].match(/\w+/g);
  var joinedBytes = bytes.join('');
  var value = '0x' + joinedBytes;

  return { id: id, value: value };
}