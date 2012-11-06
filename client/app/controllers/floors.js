var app = require('app');
var helpers = require('lib/helpers');

var homesController = require('controllers/homes');
var roomsController = require('controllers/rooms');
var floorViews = require('views/floors');

exports.floors = null;

exports.showFloors = function(home) {
    return showFloorList(home, home.defaultFloor());
};

// Events
// ---------------

app.vent.on("floor:selected", function(floor){
    showFloorList(homesController.currentHome, floor);
});

app.vent.on("floor:add", function(){
    var home = homesController.currentHome;
    var form = showAddFloorForm(home);

    form.on("save", function(floor){
        home.addFloor(floor);
        homesController.save(home);
        app.vent.trigger('home:selected', home);        
    });
});

app.vent.on("floor:edit", function(floor) {
    var form = showEditFloorForm(floor);

    form.on("save", function(floor) {
        var home = homesController.currentHome;
        homesController.save(home);
        app.vent.trigger('floor:selected', floor);
    }); 
});

app.vent.on("floor:empty", function() {
    var noFloorsView = new floorViews.NoFloorsView();
    app.main.show(noFloorsView);
});

app.vent.on("floor:editStyle", function(homeView) {
    
    var editStyleForm = new floorViews.EditStyleFloorForm({model: exports.currentFloor});
    var home = homesController.currentHome;

    editStyleForm.on("close", function(){
        if (editStyleForm.result.status === "OK") {
            homesController.save(home);
            app.vent.trigger('floor:selected', exports.currentFloor);
        }
    });

    app.modal.show(editStyleForm);
});

app.vent.on("home:saved", function(newCurrentHome){
    // Updates the floor reference
    exports.floors = homesController.currentHome.floors;
    exports.currentFloor = homesController.currentHome.floors.get(exports.currentFloor.id);
});

// Helper Methods
// --------------

var showFloorList = function(home, floor) {
    exports.floors = home.floors;
    exports.currentFloor = floor;

    exports.showDashboard(floor);

    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: floor.get('name'), 
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("floor:selected", floor);
        }
    });

    app.updateTouchNav({
        name: floor.get('name'), 
        previous: home.get('name'),
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("home:selected", home);
        }
    });

    app.touchTopOpts.show(new floorViews.OptionsContextMenuView());
    app.desktopTopOpts.show(new floorViews.OptionsContextMenuView());

    return floor;
};

var showAddFloorForm = function(home){
    var view = new floorViews.AddFloorForm({
        model: home,
        icons: icons.floors
    });
    app.modal.show(view);
    return view;
};

var showEditFloorForm = function(floor){
    var view = new floorViews.EditFloorForm({
        model: floor,
        icons: icons.floors
    });
    app.modal.show(view);
    return view;
};

/**
 * Shows the dashboard of an specified floor.
 * */
 exports.showDashboard = function(floor) {

    var view = new floorViews.FloorDashboardView ({
        model: floor
    });

    app.main.show(view);

    exports.currentDashboard = view;
    view.applyStyles();
 };
