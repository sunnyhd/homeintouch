var app = require('app');
var Homes = require('collections/homes');
var Home = require('models/home');
var homeViews = require('views/homes');

exports.homes = new Homes();

exports.showCurrent = function() {
    var home = exports.currentHome || exports.homes.defaultHome();
    return exports.showHome(home);
};

exports.showHome = function(home) {
    exports.currentHome = home;

    var view = new homeViews.HomeSelector({
        model: home,
        collection: exports.homes
    });

    app.dropdown.show(view);
    
    return home;
};

exports.saveCurrentHome = function(){
    exports.save(exports.currentHome);
};

exports.save = function(home){
    home.save();
};

exports.destroy = function(home){
    home.destroy();
};

// Application Event Handlers
// --------------------------

app.vent.on("home:selected", function(home){
    exports.showHome(home);
});

app.vent.on("address", function(address, statusValue){
    var addrs = exports.homes.findAddresses(address);
    addrs.updateAddress(address, statusValue);
});

app.vent.on("home:view", function(home){
    var form = new homeViews.ViewHomeForm({ model: home });

    form.on("home:deleted", function(deletedHome){
        exports.destroy(deletedHome);

        var home = exports.homes.at(0);
        app.vent.trigger('home:selected', home);
    });

    app.modal.show(form);
});