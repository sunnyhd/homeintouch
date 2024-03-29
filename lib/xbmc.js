var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../config');
var JSONStream = require('./json-stream');
var stream = new JSONStream();

var xbmc = module.exports = new EventEmitter();

var hit = settings.hosts.hit;
var requests = {};

xbmc.client = new HitClient({
    hostname: hit.hostname,
    port: hit.port
});

xbmc.connect = function(callback) {
    xbmc.client.connect();
    
    xbmc.client.on('connect', function() {
        xbmc.client.send('hitbot_listen', 'xbmc');
        if (callback) callback();
    });
    
    xbmc.client.on('data', function(data) {
        stream.write(data);
    });

    stream.on('data', function(obj) {
        processData(obj);
    });

    xbmc.client.on('error', function(err) {
        console.log('xbmc error: %s', err);
        
        for (var id in requests) {
            var request = requests[id];
            request.handle(err);
        }
        
        requests = {};
    });
};

xbmc.query = function(query, callback) {
    query.id = genId();
    xbmc.client.send('hitbot_send', 'xbmc', JSON.stringify(query));
    requests[query.id] = new Request(callback, query);
};

xbmc.rpc = function(method, params, callback) {
    if (callback === undefined) {
        callback = params;
        params = null;
    }

    console.log('XBMC RPC. Method: ' + method + ' Params: ' + JSON.stringify(params));
    
    var query = { jsonrpc: '2.0', method: method };
    if (params !== null) {
        query.params = params;
    }
    
    xbmc.query(query, callback);
};

xbmc.execute = function(command) {
    console.log('XBMC command sent: ' + command);
    console.log('Is server running? ' + xbmc.serverUp);

    if (command === 'start' && !xbmc.serverUp) {
        xbmc.client.send('hitbot_send', 'xbmc', command);
    }
};

// XBMC data parser
// ---------------

function processData(obj) {

    if (obj.id === undefined && obj.error) {
        // Return error to all pending requests
        for (var id in requests) {
            var request = requests[id];
            request.handle(new Error(obj.error));

            delete requests[id];
        }
    } else if (obj.id) {
        // Response
        var request = requests[obj.id];
        if (!request) return;
        
        if (obj.error) {
            request.handle(new Error(JSON.stringify(obj.error)));
        } else {
            request.handle(null, obj.result);
        }

        delete requests[obj.id];
    } else {
        // Notification
        xbmc.emit('notification', obj);
    }
};

// Helpers
// ---------------

var count = 1;

function genId() {
    return count++;
}

// Request
// ---------------

function Request(callback, query) {
    this.callback = callback;
    this.timeout = setTimeout(this.timeout.bind(this), hit.timeout);
    this.query = query;
}

Request.prototype.handle = function() {
    clearTimeout(this.timeout);
    if (arguments[0]) {
        // First argument is error.
        xbmc.serverUp = false;
    } else {
        xbmc.serverUp = true;
    }
    if (this.callback) {
        this.callback.apply(xbmc, arguments);
    }
};

Request.prototype.timeout = function() {
    console.log('Timeout');
    this.callback({error: 'Timeout', query: this.query});
    this.callback = null;
    xbmc.serverUp = false;
};