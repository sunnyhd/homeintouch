var net = require('net');

var proxy = function(host, port) {
    return net.createServer(function(socket) {
        var client = net.connect(port, host);

        client.pipe(socket);
        socket.pipe(client);
    });
};

proxy('192.168.2.20', 8090).listen(8090);
proxy('192.168.2.20', 8080).listen(8080);