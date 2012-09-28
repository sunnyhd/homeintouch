var app = require('app');
var helpers = require('lib/helpers');

var homesController = require('controllers/homes');
var floorsController = require('controllers/floors');

var roomViews = require('views/rooms');

exports.showRooms = function(floor, room) {
    (room) || (room = floor.defaultRoom());
    return exports.showRoom(floor, room);
};

exports.showCurrent = function() {
    return exports.showRoom(floorsController.currentFloor, exports.currentRoom);
};

exports.showRoom = function(floor, room) {
    var rooms = floor.rooms;
    exports.currentRoom = room;

    var moreOptView = new roomViews.RoomMoreOptionsView({
        model: room
    });
    moreOptView.render();
    
    if (room.deviceGroups.length > 0) {
        var roomLayoutView = new roomViews.RoomLayout({
            model: room,
            collection: room.deviceGroups
        });
        app.main.show(roomLayoutView);

        // After the elements are added to the DOM:
        // start the Gridster.js library to allow drag & drop of device groups
        // start the tinyscroll.js to insert scroll bars to the device groups
        roomLayoutView.initializeUIEffects();
        
    } else {
        var noDeviceGroupsView = new roomViews.NoDeviceGroupView();
        app.main.show(noDeviceGroupsView);
    }

    app.updateDesktopBreadcrumbNav( { 
        itemType: 'room',
        name: room.get('name'), 
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("room:selected", room);
        }
    });

    app.updateTouchNav({
        name: room.get('name'), 
        previous: floor.get('name'),
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("floor:selected", floor);
        }
    });
    
    return room;
};

// Helper Functions
// ----------------

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

function getRoomNavContainer() {
    $('#home-nav-ul #room-li').remove();
    $('#home-nav-ul #room-more-opts').remove();
    return helpers.getOrCreateEl('home-nav-ul', {type: 'ul', container: '#nav-container'});
}

var showAddRoom = function(floor){
    var form = new roomViews.AddRoomForm({ model: floor });
    app.modal.show(form);
    return form;
};

// App Event Handlers
// ------------------

app.vent.on("room:selected", function(room) {
    exports.showRoom(floorsController.currentFloor, room);
});

app.vent.on("room:add", function() {
    var floor = floorsController.currentFloor;
    var form = showAddRoom(floor);

    form.on("save", function(room) {
        floor.addRoom(room);
        homesController.saveCurrentHome();
        app.vent.trigger("room:selected", room);
    });
});

app.vent.on("floor:empty", function() {
    getRoomNavContainer();
});

app.vent.on("room:empty", function() {
    getRoomNavContainer();

    var noRoomView = new roomViews.NoRoomsView();
    app.main.show(noRoomView);
});

app.vent.on("room:remove-dropdown", function() {
    getRoomNavContainer();
});
