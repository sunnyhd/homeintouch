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

/*app.vent.on("home:selected", function(home) {
    if (home.floors.length) {
        app.vent.trigger("floor:selected", home.floors.defaultFloor());
    } else {
        app.vent.trigger("floor:empty");
    }
});*/

app.vent.on("floor:selected", function(floor){
    
    app.vent.trigger("room:remove-dropdown");
    showFloorList(homesController.currentHome, floor);

    /*if (floor.rooms.length) {
        app.vent.trigger("room:selected", floor.rooms.defaultRoom());
    } else {
        app.vent.trigger("room:empty");
    }*/
});

app.vent.on("floor:add", function(){
    var home = homesController.currentHome;
    var form = showAddFloorForm(home);

    form.on("save", function(floor){
        home.addFloor(floor);
        homesController.save(home);
    });
});

app.vent.on("floor:empty", function() {
    getFloorNavContainer();

    var noFloorsView = new floorViews.NoFloorsView();
    app.main.show(noFloorsView);
});

app.vent.on("floor:remove-dropdown", function() {
    getFloorNavContainer();
});

// Helper Methods
// --------------

function getFloorNavContainer() {
    $('#home-nav-ul #floor-li').remove();
    return helpers.getOrCreateEl('home-nav-ul', {type: 'ul', container: '#nav-container'});
}

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

    // Touch navigation
    $('#home-touch-title').html('&nbsp;' + floor.get('name'));
    var $touchNav = $('#touch-top-nav');
    $('a span', $touchNav).html('&nbsp;' + home.get('name'));
    $('a', $touchNav).off('click').on('click', function(e) {
        e.preventDefault();
        app.vent.trigger("home:selected", home);
    });
    $touchNav.show();

    return floor;
};

var showAddFloorForm = function(home){
    var view = new floorViews.AddFloorForm({
        model: home
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
 };
