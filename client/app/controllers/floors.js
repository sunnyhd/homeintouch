var app = require('app');
var homesController = require('controllers/homes');
var roomsController = require('controllers/rooms');
var floorViews = require('views/floors');

exports.showFloors = function(home) {
    showFloorList(home.floors);
    showFirstRoom(home);
};

// Events
// ---------------

app.vent.on("home:selected", function(home) {
    exports.showFloors(home);
});

app.vent.on("floor:add", function(){
    var home = homesController.currentHome;
    var form = showAddFloorForm(home);

    form.on("save", function(floor){
        home.addFloor(floor);
        homesController.save(home);
    });
});

// Helper Methods
// --------------

var showFirstRoom = function(home){
    var floor = home.floors.at(0);
    var clear = true;

    if (floor){
        var room = floor.rooms.at(0);
        if (room){
            roomsController.showRoom(room);
            clear = false;
        }
    }

    // clear the main display area if no floor / room
    // was found for display in the selected home
    if (clear){
        var view = new floorViews.NoFloorsView({
            model: home
        }); 
        app.main.show(view);
    }

};

var showFloorList = function(floors){
    var view = new floorViews.FloorSelectorListView({
        collection: floors
    });

    app.navList.show(view);
};

var showAddFloorForm = function(home){
    var view = new floorViews.AddFloorForm({
        model: home
    });
    app.modal.show(view);
    return view;
};