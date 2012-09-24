var app = require('app');
var helpers = require('lib/helpers');

var Homes = require('collections/homes');
var Home = require('models/home');
var homeViews = require('views/homes');

exports.homes = new Homes();

exports.showCurrent = function() {
    var home = exports.currentHome || exports.homes.defaultHome();
    return exports.showHome(home);
};

/**
 * 
 * */
exports.showHome = function(home) {
    exports.currentHome = home;

    // Creates the home navigation bar
    var view = new homeViews.HomeSelector({
        model: home,
        collection: exports.homes
    });
    
    view.render().done(function(){
        getHomeNavContainer().append(view.$el);
    });

    exports.showDashboard(home);
    
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

/**
 * Shows the dashboard of an specified home.
 * */
 exports.showDashboard = function(home) {

    var view = new homeViews.HomeDashboardView({
        model: home
    });

    app.main.show(view);
 };

// Helper Methods
// --------------

function getHomeNavContainer() {
    if (!helpers.elExists('#nav-container')) {
        $container = helpers.getOrCreateEl('nav-container', {container: app.subnav.el});
        $container.addClass('home-aut-nav-container');
    }
    $('#home-nav-ul #home-li').remove();
    var $ul = helpers.getOrCreateEl('home-nav-ul', {type: 'ul', container: '#nav-container'});
    return $ul.addClass('nav nav-pills');
}

// Application Event Handlers
// --------------------------

app.vent.on("home:selected", function(home){
    app.vent.trigger("room:remove-dropdown");
    app.vent.trigger("floor:remove-dropdown");
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