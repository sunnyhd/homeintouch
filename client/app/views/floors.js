var app = require('app');
var Floor = require('models/floor');

// Views
// -----

exports.NoFloorsView = Backbone.Marionette.ItemView.extend({

    template: "#no-floors-template",

    events: {
        "click a.view-home": "viewClicked"
    },

    viewClicked: function(e){
        app.vent.trigger("home:view", this.model);
    }

});

exports.RoomItemView = Backbone.Marionette.ItemView.extend({

    tagName: "li",

    template: "#room-item-template",

    events: {
        "click a": "roomClicked"
    },

    roomClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:selected", this.model);
    }
});

exports.FloorItemView = Backbone.Marionette.CompositeView.extend({

    className: "dropdown",

    tagName: "li",

    template: "#floor-item-template",

    itemView: exports.RoomItemView,

    events: {
        "click .add-room": "addRoomClicked"
    },

    initialize: function(){
        this.collection = this.model.rooms;
    },

    addRoomClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:add", this.model);
    },

    appendHtml: function(cv, iv){
        var $splitter = cv.$("ul.dropdown-menu li.divider");
        $splitter.before(iv.el);
    }

});

exports.FloorSelectorListView = Backbone.Marionette.CompositeView.extend({

    className: 'nav nav-pills',

    tagName: 'ul',

    template: "#floor-list-template",

    itemView: exports.FloorItemView,

    events: {
        "click .add-floor": "addFloorClicked"
    },

    addFloorClicked: function(e){
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

    appendHtml: function(cv, iv){
        var $addNew = cv.$(".add-new");
        $addNew.before(iv.el);
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