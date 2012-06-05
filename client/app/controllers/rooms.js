var app = require('app');
var homesController = require('controllers/homes');
var roomViews = require('views/rooms');

exports.showCurrent = function() {
    return exports.showRoom(exports.currentRoom);
};

exports.showRoom = function(room) {
    exports.currentRoom = room;
    
    var view = new roomViews.RoomLayout({
        model: room,
        collection: room.deviceGroups
    });
    
    app.main.show(view);
    return room;
};

// Helper Functions
// ----------------

var showAddRoom = function(floor){
    var form = new roomViews.AddRoomForm({ model: floor });
    app.modal.show(form);
    return form;
};

// App Event Handlers
// ------------------

app.vent.on("room:selected", function(room) {
    exports.showRoom(room);
});

app.vent.on("room:add", function(floor){
    var form = showAddRoom(floor);

    form.on("save", function(room){
        floor.addRoom(room);
        homesController.saveCurrentHome();
        app.vent.trigger("room:selected", room);
    });
});