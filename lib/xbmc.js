var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../data/settings');

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
        var dataArray = data.split(/\}\s*\{/); 

        if (dataArray.length > 1) {
            for (var i = 0; i < dataArray.length; i++) {
                var dataItem = dataArray[i];
                if (i % 2 == 0) {
                    dataItem += '}';
                } else {
                    dataItem = '{' + dataItem;
                }

                var obj;
                try {
                    obj = JSON.parse(dataItem);
                } catch(syntaxError) {
                    console.log('Syntax Error of data: ' + dataItem);
                    return;
                }    

                processData(obj);
            }
        } else {
            var dataItem = data;
            var obj;
            try {
                obj = JSON.parse(dataItem);
            } catch(syntaxError) {
                console.log('Syntax Error of data: ' + dataItem);
                return;
            }    

            processData(obj);
        }

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
    requests[query.id] = new Request(callback);
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

function Request(callback) {
    this.callback = callback;
    this.timeout = setTimeout(this.timeout.bind(this), hit.timeout);
}

Request.prototype.handle = function() {
    clearTimeout(this.timeout);

    if (this.callback) {
        this.callback.apply(xbmc, arguments);
    }
};

Request.prototype.timeout = function() {
    this.callback(new Error('Timeout'));
    this.callback = null;
};