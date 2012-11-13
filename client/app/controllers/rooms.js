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
    app.showingFavorites = false;
    
    if (room.deviceGroups.length > 0) {
        var roomLayoutView = new roomViews.RoomLayout({
            model: room,
            collection: room.deviceGroups
        });
        app.main.show(roomLayoutView);
        exports.currentDashboard = roomLayoutView;

        // After the elements are added to the DOM:
        // start the tinyscroll.js to insert scroll bars to the device groups
        roomLayoutView.initializeUIEffects();
        roomLayoutView.applyStyles();

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

    var menuOpts = {model: room};
    app.touchTopOpts.show(new roomViews.OptionsContextMenuView(menuOpts));
    app.desktopTopOpts.show(new roomViews.OptionsContextMenuView(menuOpts));
    
    return room;
};

exports.showFavorites = function(home) {

    var room = home.getFavorites();
    app.showingFavorites = true;

    if (room.deviceGroups.length > 0) {
        var roomLayoutView = new roomViews.FavoriteRoomLayout({
            model: room,
            collection: room.deviceGroups
        });
        app.main.show(roomLayoutView);
        exports.currentDashboard = roomLayoutView;

        // After the elements are added to the DOM:
        // start the tinyscroll.js to insert scroll bars to the device groups
        roomLayoutView.initializeUIEffects();
        roomLayoutView.applyStyles();

    } else {
        var noDeviceGroupsView = new roomViews.FavoriteNoDeviceGroupView();
        app.main.show(noDeviceGroupsView);
    }
    
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor', // Workaround to display the 'Favorites' button
        name: 'Favorites', 
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("home:selected", home);
        }
    });

    app.updateTouchNav({
        name: 'Favorites', 
        previous: home.get('name'),
        handler: function(e) {
            e.preventDefault();
            app.vent.trigger("home:selected", home);
        }
    });
    
    app.touchTopOpts.show(new roomViews.OptionsFavoriteContextMenuView({model: room}));
    app.desktopTopOpts.show(new roomViews.OptionsFavoriteContextMenuView({model: room}));

    return home;
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

var showAddRoom = function(floor){
    var form = new roomViews.AddRoomForm({ 
        model: floor,
        icons: icons.rooms
    });
    app.modal.show(form);
    return form;
};

var showEditRoomForm = function(room){
    var view = new roomViews.EditRoomForm({
        model: room,
        icons: icons.rooms
    });
    app.modal.show(view);
    return view;
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
        exports.addedRoom = room;
    });
});

app.vent.on("room:edit", function(room) {
    var form = showEditRoomForm(room);

    form.on("save", function(room) {
        var home = homesController.currentHome;
        homesController.saveCurrentHome();
        exports.addedRoom = room;
    }); 
});

app.vent.on("room:empty", function() {
    var noRoomView = new roomViews.NoRoomsView();
    app.main.show(noRoomView);
});

app.vent.on("room:editStyle", function(roomView) {
    
    var editStyleForm = new roomViews.EditStyleRoomForm({model: exports.currentRoom});

    editStyleForm.on("close", function(){
        if (editStyleForm.result.status === "OK") {
            homesController.saveCurrentHome();
            app.vent.trigger('room:selected', exports.currentRoom);
        }
    });

    app.modal.show(editStyleForm);
});

app.vent.on("home:saved", function(newCurrentHome){
    if (exports.addedRoom) {
        app.vent.trigger("room:selected", exports.addedRoom);
        exports.addedRoom = null;
    } else {
        if (exports.currentRoom) {
            var currentFloor = homesController.currentHome.floors.get(exports.currentRoom.collection.parentFloor.id);
            exports.currentRoom = currentFloor.rooms.get(exports.currentRoom.id);

            exports.showRoom(currentFloor, exports.currentRoom);    
        } else if (app.showingFavorites) {
            app.vent.trigger("custom-page:favorites", homesController.currentHome);
        }
    }
});

app.vent.on("custom-page:favorites", function(home) {
    console.log('home: ' + home.id);
    exports.showFavorites(home);
});

app.vent.on("favorites:editStyle", function(room) {
    
    var editStyleForm = new roomViews.EditStyleFavoriteForm({model: homesController.currentHome, room: room});

    editStyleForm.on("close", function(){
        if (editStyleForm.result.status === "OK") {
            homesController.saveCurrentHome();
            exports.showFavorites(homesController.currentHome);
        }
    });

    app.modal.show(editStyleForm);
});
