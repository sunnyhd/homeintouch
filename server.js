var express = require('express');
var mongoose = require('mongoose');
var socket = require('socket.io');
var client = require('./lib/client');
var dataStore = require('./lib/dataStore');
var eib = require('./lib/eib');
var mediaManager = require('./lib/media_manager');

var routes = require('./app/routes');
var xbmc = require('./lib/xbmc');
var settings = require('./config');
var fs = require('fs');
var compressor = require('node-minify');

var app = express.createServer();
var io = socket.listen(app);

// Config
// ---------------

app.configure(function() {
    app.set('views', __dirname + '/app/views');
    app.set('view engine', 'jade');

    io.set('log level', 2);

    //app.use(express.basicAuth(settings.credentials.username, settings.credentials.password));
    app.use(express.bodyParser());

    if (settings.client.compileLess) {
        client.compileLess();
    }

    client.buildCssLibrary();

    if (settings.client.cache) {
        client.minifyJS();
    } else {
        app.get('/application.js', client.assets.createServer());
    }

    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

routes(app);

// Notifications
// ---------------

io.sockets.on('connection', function (socket) {
    socket.on('eib:set', eib.set);
    socket.on('eib:get', eib.get);
    socket.on('eib:command:send', eib.commandSend);
    socket.on('xbmc:command:send', xbmc.execute);
});

eib.on('address', function(id, value) {
    console.log('eib:address', id, value);
    io.sockets.emit('eib:address', id, value);
});

xbmc.on('notification', function(data) {
    console.log('xbmc:notification', JSON.stringify(data));
    
    // Let the media manager try to process the notification first, and then notify the client app.
    mediaManager.onMediaCenterLibraryUpdate(data)
    .then(function(notificationData) {
        io.sockets.emit('xbmc:notification', notificationData);
    })
    .fail(function(err) {
        console.log('Error while processing xbmc notification: ' + err);
    });
});

mediaManager.on('done', function(time) {
    console.log('mediaManager:done', time);
    io.sockets.emit('media:data-changed'); // Notifies the client that the media data has changed
});

mediaManager.on('error', function(err) {
    console.log('mediaManager:error', err);
});

// Bootstrap
// ---------------
dataStore.init(settings.database.path);
mongoose.connect(settings.database.mongodb);
eib.connect();
xbmc.connect();

app.listen(settings.hosts.web.port, function() {
    console.log('now listening on %s...', settings.hosts.web.port);
});