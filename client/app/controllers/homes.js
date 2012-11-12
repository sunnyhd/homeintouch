var app = require('app');
var helpers = require('lib/helpers');

var Homes = require('collections/homes');
var Home = require('models/home');
var homeViews = require('views/homes');

exports.homes = new Homes();

var widgetEditViews = {
    "my-house": homeViews.EditStyleWidgetForm,
    "my-library": homeViews.EditStyleWidgetForm,
    "time-wheater": homeViews.EditTimeWeatherForm
};

exports.startPage = function() {
    var home = exports.currentHome || exports.homes.defaultHome();
    var startPage = home.get('startPage');
    if (startPage !== null && !_.isUndefined(startPage)) {
        var startPageArray = startPage.split('-');
        var startPageType = startPageArray[0];
        
        if (startPageType === 'floor') {
            var startPageId = startPageArray[1];
            var floor = home.getFloorById(startPageId);
            if (floor !== null && !_.isUndefined(floor)) {
                exports.setHomeData(home);
                app.vent.trigger('floor:selected', floor);
            }    
        } else if (startPageType === 'room') {
            var floorId = startPageArray[1];
            var floor = home.getFloorById(floorId);
            if (floor !== null && !_.isUndefined(floor)) {
                var startPageId = startPageArray[2];
                var room = floor.getRoomById(startPageId);
                if (room !== null && !_.isUndefined(room)) {
                    exports.setHomeData(home);
                    app.vent.trigger('floor:setData', floor);
                    app.vent.trigger('room:selected', room);
                }
            }
        } else if (startPageType === 'home') {
            exports.showCurrent();    
        }

        // Start Page Timeout (expressed in seconds).
        var startPageTimeout = home.get('startPageTimeout');

        if (startPageTimeout !== null) {
            app.setStartPageTimeout(startPageTimeout);
        }

    } else {
        exports.showCurrent();
    }
};

exports.showCurrent = function() {
    var home = exports.currentHome || exports.homes.defaultHome();
    exports.showHome(home);    
};

exports.showHome = function(home) {
    exports.setHomeData(home);
    exports.showDashboard(home);

    app.touchTopOpts.show(new homeViews.OptionsContextMenuView());
    app.desktopTopOpts.show(new homeViews.OptionsContextMenuView());
    
    return home;
};

exports.setHomeData = function(home) {
    exports.currentHome = home;

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
};

exports.saveCurrentHome = function(){
    exports.save(exports.currentHome);
};

exports.save = function(home){
    home.save(home.attributes, {success: function(model, response){
            model.parseInnerData();
            app.vent.trigger("home:saved", model);
        }
    });
};

exports.destroy = function(home){
    home.destroy();
};

/**
 * Shows the dashboard of an specified home.
 * */
 exports.showDashboard = function(home) {

    var view = new homeViews.HomeDashboardView({
        model: home,
        collection: home.widgets
    });
    app.main.show(view);

    exports.currentDashboard = view;

    var openSwitchHandler = function(e) {
        e.preventDefault();
        app.vent.trigger("home:switch", home);
    };

    $('#desktop-top-switch, #touch-top-switch').off('click').on('click', openSwitchHandler);

    view.applyStyles();    
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

app.vent.on("home:edit", function(home) {
    var form = new homeViews.EditHomeForm({model: home});

    form.on("close", function() {
        if (form.status === "OK") {
            exports.saveCurrentHome();
            exports.showCurrent();    
        }        
    }); 

    app.modal.show(form);
});

app.vent.on("home:editWidget", function(widgetView) {

    var EditStyleView = widgetEditViews[widgetView.model.get('type')];

    var editStyleForm = new EditStyleView({model: widgetView.model});

    editStyleForm.on("close", function(){
        if (editStyleForm.result.status === "OK") {
            exports.saveCurrentHome();
            widgetView.updateStyles();
        }
    });

    app.modal.show(editStyleForm);
});

app.vent.on("home:editStyle", function(homeView) {
    
    var editStyleForm = new homeViews.EditStyleHomeForm({model: exports.currentHome});

    editStyleForm.on("close", function(){
        if (editStyleForm.result.status === "OK") {
            exports.saveCurrentHome();
            exports.showCurrent();
        }
    });

    app.modal.show(editStyleForm);
});

app.vent.on("home:saved", function(newHome) {

    _.each(_.values(exports.currentDashboard.children), function(itemView){
        itemView.model = exports.currentHome.widgets.get(itemView.model.id);
    });

    var newStartPageTimeout = newHome.get('startPageTimeout');

    if (app.startPageInterval !== newStartPageTimeout) {
        app.resetStartPageTimeout(newStartPageTimeout);
    }
});

app.vent.on('home:showStartPage', function() {
    exports.startPage();
});