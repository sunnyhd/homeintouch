var EventEmitter = require('events').EventEmitter;
var net = require('net');
var HitClient = require('./hit_client');
var settings = require('../config');
var JSONStream = require('./json-stream');
var stream = new JSONStream();
var queue = require('./queue')

var xbmc = module.exports = new EventEmitter();

var hit = settings.hosts.hit;
var runningRequests = {};

xbmc.client = new HitClient({
    hostname: hit.hostname,
    port: hit.port
});

// Request queue management
var requestQueue = queue.up(function (request) {
    console.log('Executing request', request.id);
    console.log('Sending query', JSON.stringify(request.query));
    xbmc.client.send('hitbot_send', 'xbmc', JSON.stringify(request.query));
    runningRequests[request.id] = request;
    request.run();
});
requestQueue.concurrency = settings.hosts.xbmc.concurrency || 50;


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

        clearAllRequests(err);
    });
};

xbmc.addQuery = function(query, callback) {
    var request = new Request(callback, query);
    console.log('Adding request %d to queue', request.id);
    requestQueue.enqueue(request);
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
    
    xbmc.addQuery(query, callback);
};

xbmc.execute = function(command) {
    console.log('XBMC command sent: ' + command);
    console.log('Is server running? ' + xbmc.serverUp);

    if (command === 'start' && !xbmc.serverUp) {
        xbmc.client.send('hitbot_send', 'xbmc', command);
    }
};

/**
 * Removes all pending and running requests due to an error in XBMC.
 */
function clearAllRequests(err) {
    // Remove all pending requests
    requestQueue.clear();
        
    // Return error to all running requests
    failAllRunningRequests(err);
}

/**
 * Clears the running request map and return an error to each request callback
 */
function failAllRunningRequests(err) {
    for (var id in runningRequests) {
        var request = runningRequests[id];
        request.handle(err);

        delete runningRequests[id];
    }
    runningRequests = {};
}

// XBMC data parser
// ---------------

function processData(obj) {

    if (obj.id === undefined && obj.error) {
        clearAllRequests(new Error(obj.error));
    } else if (obj.id) {
        // Response
        var request = runningRequests[obj.id];
        if (!request) return;
        
        // Notify the queue that a new slot for running requests has been open.
        requestQueue.pop();
        
        if (obj.error) {
            request.handle(new Error(JSON.stringify(obj.error)));
        } else {
            request.handle(null, obj.result);
        }

        delete runningRequests[obj.id];
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
    this.id = genId();
    this.callback = callback;
    this.cancelled = false;
    this.query = query;
    query.id = this.id;
}

Request.prototype.run = function() {
    this.timeout = setTimeout(this.timeout.bind(this), hit.timeout);
}

Request.prototype.handle = function() {
    clearTimeout(this.timeout);
    if (arguments[0]) {
        // First argument is error.
        xbmc.serverUp = false;
    } else {
        xbmc.serverUp = true;
    }
    if (!this.cancelled) {
        this.callback.apply(xbmc, arguments);
    }
};

Request.prototype.timeout = function() {
    console.log('Timeout');
    this.callback({error: 'Timeout', query: this.query});
    this.cancelled = true;
    xbmc.serverUp = false;
};