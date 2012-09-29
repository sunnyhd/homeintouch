var app = require('app');
var floorsController = require('controllers/floors');
var Floor = require('models/floor');

// Views
// -----

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-floor-opts",

    events: {
        'click a.add-room': 'addRoomHandler'
    },

    addRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:add");
    }
});

/** 
 * Floor dashboard view.
 * */
exports.FloorDashboardView = Backbone.Marionette.ItemView.extend({
    template: "#dashboard-floor",

    events: {
        "click .room-item-list": "roomClicked",
        "click a.add-room": "addRoomHandler"
    },

    roomClicked: function(e){
        e.preventDefault();
        var roomId = ($(e.currentTarget).data('item-id'));
        app.vent.trigger("room:selected", this.model.getRoomById(roomId));
    },

    addRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:add");
    }
});

exports.NoFloorsView = Backbone.Marionette.ItemView.extend({
    template: "#no-floors-template",

    events: {
        "click a.view-home": "viewClicked"
    },

    viewClicked: function(e){
        app.vent.trigger("home:view", this.model);
    }
});

/**
 * Floor Navigator Dropdown Item.
 * */
exports.FloorItemView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#home-auto-nav-item",

    events: {
        "click a": "floorClicked"
    },

    floorClicked: function(e){
        e.preventDefault();
        floorsController.floors.select(this.model);
    }
});

/**
 * Floor Navigator Dropdown: Creates a dropdown with the floors and an option to create a new one.
 * */
exports.FloorSelector = Backbone.Marionette.CompositeView.extend({
    tagName: "li",
    id: "floor-li",
    className: "hit-nav dropdown",
    template: "#home-auto-nav-composite-item",
    itemView: exports.FloorItemView,

    events: {
        "click .add-item": "addFloorClicked"
    },

    addFloorClicked: function(e){
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

    /*appendHtml: function(cv, iv){
        var $addNew = cv.$(".add-new");
        $addNew.before(iv.el);
    }*/
    appendHtml: function(cv, iv){ // cv: CollectionView, it: ItemView
        cv.$("ul.dropdown-menu").prepend(iv.el);
    }
});

exports.AddFloorForm = Backbone.Marionette.ItemView.extend({

    template: "#floor-add-template",

    formFields: ["name", "rooms"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    saveClicked: function(e){
        e.preventDefault();

        var data = Backbone.FormHelpers.getFormData(this);
        var roomNames = data.rooms.split(","); delete data.rooms;
        
        var rooms = [];
        
        for(var i = 0, length = roomNames.length; i<length; i++){
            var roomName = $.trim(roomNames[i]);
            var room = {
                name: roomName
            };
            rooms.push(room);
        }

        var floor = new Floor({
            name: data.name,
            rooms: rooms
        });

        this.trigger("save", floor);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }
    
});