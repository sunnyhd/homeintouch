var express = require('express');
var mongoose = require('mongoose');
var socket = require('socket.io');
var client = require('./lib/client');
var dataStore = require('./lib/dataStore');
var eib = require('./lib/eib');
var importer = require('./lib/importer');
var routes = require('./app/routes');
var xbmc = require('./lib/xbmc');
var settings = require('./config');
var fs = require('fs');

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
    
    app.use(express.static(__dirname + '/public'));

    if (settings.cache) {
        var clientPath = './public/application.js';
        var fileExists = fs.existsSync(client);
        if (fileExists) {
            fs.unlinkSync(clientPath);
        }

        client.assets.compile(function (err, source) {
            fs.writeFile('./public/application.js', source, function (err) {
                if (err) throw err;
                console.log('Compiled application.js');
            });
        });
    } else {
        app.get('/application.js', client.assets.createServer());
    }
    
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
    
    // Let the importer try to process the notification first, and then notify the client app.
    importer.notification(data, function(notificationData) {
        io.sockets.emit('xbmc:notification', notificationData);
    });
});

importer.on('done', function(time) {
    console.log('importer:done', time);
    io.sockets.emit('media:data-changed'); // Notifies the client that the media data has changed
});

importer.on('error', function(err) {
    console.log('importer:error', err);
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