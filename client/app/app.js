var Router = require('router');
var ModalManager = require('lib/modal_manager');

var app = module.exports = new Backbone.Marionette.Application();
var socket;

// EIBD <-> Decimal conversion
app.eibdToDecimal = function (n){return (n - 0x800) / 0x32 };
app.decimalToEibd = function (n){return n * 0x32 + 0x800 };

app.addRegions({
    dropdown: '#dropdown',
    subnav: '#subnav',
    main: '#main-content',
    modal: ModalManager
});

app.closeRegions = function() {
    app.dropdown.close();
    app.subnav.close();
    app.main.close();
    app.modal.close();
};

app.vent.on('device:read', function(address){
    socket.emit('eib:get', address);
});

app.vent.on('device:write', function(address, value){
    socket.emit('eib:set', address, value);
});

var controllers = {};
app.controller = function(name) {
    if (!controllers[name]) {
        controllers[name] = require('controllers/' + name);
    }
    return controllers[name];
};

// Initializers
// ---------------

app.addInitializer(function() {
    // Load controllers
    app.controller('device_types');
    app.controller('devices');
    app.controller('floors');
    app.controller('homes');
    app.controller('rooms');
    app.controller('players');
    app.controller('playlists');
    app.controller('movies');
    app.controller('music');
});

app.addInitializer(function(options) {
    // Load bootstrapped data
    app.controller('device_types').deviceTypes.reset(options.deviceTypes);
    app.controller('homes').homes.reset(options.homes);
    app.controller('players').ids = options.players;
});

app.addInitializer(function() {
    // Bind socket events
    socket = io.connect();

    socket.on('connect', function() {
        app.vent.trigger('socket:connected');
    });

    socket.on('disconnect', function() {
        app.vent.trigger('socket:disconnected');
    });

    socket.on('error', function(err){
        console.log('socket error:', err);
    });

    socket.on('eib:address', function(id, value) {
        console.log('address: ', id, value);
        app.vent.trigger('address', id, value);
    });

    socket.on('xbmc:notification', function(data) {
        var method = data.method.split('.');
        var e = ['xbmc', method[0].toLowerCase(), method[1].toLowerCase()].join(':');
        app.vent.trigger(e, data.params.data);
    });
});

app.addInitializer(function() {
    $('a').live('click', function(e) {
        if ($(this).attr('href') === '#') {
            e.preventDefault();
        }
    });

    // Start router
    app.router = new Router({ app: app });
    Backbone.history.start();
});

// Extensions
// ---------------

Backbone.Marionette.View.prototype.getTemplateSelector = function() {
    var template;

    if (this.options && this.options.template){
        template = this.options.template;
    } else {
        template = this.template;
    }

    return template;
};

var origRender = Backbone.Marionette.Renderer.render;
Backbone.Marionette.Renderer.render = function(template, data){
    if (typeof template === 'string') {
        return origRender.apply(Backbone.Marionette.Renderer, arguments);
    } else {
        var render = $.Deferred();
        render.resolve(template(data));
        return render.promise();
    }
};

var viewHelpers = {
    getAddress: function(addressType){
        var address = _.find(this.addresses, function(addr){
            return addr.type == addressType
        });
        return address;
    }
};

// apply all view helpers to the base item view's serialize data
var itemViewPrototype = Backbone.Marionette.ItemView.prototype;
itemViewPrototype.serializeData = _.wrap(itemViewPrototype.serializeData, function(original){
    var data = original.apply(this, arguments);

    if (data) {
        _.extend(data, viewHelpers);
    }

    return data;
});