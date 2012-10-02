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

exports.showHome = function(home) {
    exports.currentHome = home;
    exports.showDashboard(home);

    $('#desktop-breadcrumb-nav').find('li span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( {
        clear: true,
        name: home.get('name'), 
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("home:selected", home);
        }
    });

    // Touch navigation
    $('#home-touch-title').html('&nbsp;' + home.get('name'));
    $('#touch-top-nav').hide();

    app.touchTopOpts.show(new homeViews.OptionsContextMenuView());
    app.desktopTopOpts.show(new homeViews.OptionsContextMenuView());
    
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

    var openSwitchHandler = function(e) {
        e.preventDefault();
        app.vent.trigger("home:switch", home);
    };

    $('#desktop-top-switch, #touch-top-switch').off('click').on('click', openSwitchHandler);

    app.hitIcons(view.$el);
 };

// Helper Methods
// --------------

// methods

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

app.vent.on("home:switch", function(home) {

    var switchView = new homeViews.SwitchSelectedHomeView({
        model: home,
        homes: exports.homes
    });

    app.modal.show(switchView);
});