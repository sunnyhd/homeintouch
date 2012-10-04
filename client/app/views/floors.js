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
        "click a.add-room": "addRoomHandler",
        "click a.hit-slider-control": "sliderClickedHandler",
        "webkitTransitionEnd .hit-slider-inner": "endTransition"
    },

    roomClicked: function(e){
        e.preventDefault();
        var roomId = ($(e.currentTarget).data('item-id'));
        app.vent.trigger("room:selected", this.model.getRoomById(roomId));
    },

    addRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:add");
    },

    endTransition: function(e) {
        $(e.currentTarget).data('transitioning', false);
    },

    sliderClickedHandler: function(e) {
        e.preventDefault();
        var $el = $(e.currentTarget);
        var $slider = $('.hit-slider-inner', $el.parent());

        if (!$slider.data('transitioning')) {
            var marginLeft = $slider.getPixels('margin-left');

            if ($el.data('slide') === "next") {
                marginLeft -= 92;
                $slider.data('transitioning', true);
            } else if (marginLeft < 0) {
                marginLeft += 92;
                $slider.data('transitioning', true);
            }
            $slider.setPixels('margin-left', marginLeft);
        }
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