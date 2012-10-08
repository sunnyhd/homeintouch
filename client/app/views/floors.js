var app = require('app');
var floorsController = require('controllers/floors');
var Floor = require('models/floor');
var Configuration = require('models/configuration');

// Views
// -----

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-floor-opts",

    events: {
        'click a.add-room': 'addRoomHandler',
        'click a#editStyle': 'editStyle'
    },

    addRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:add");
    },

    editStyle: function() {
        app.vent.trigger("floor:editStyle", this);
        return false;
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

     onRender: function() {
        this.applyStyles();
    },

    applyStyles: function() {
        $(this.model.bodySelector).removeAttr('style');

        if (this.model.has('bodyConfiguration')) {
            var bodyConfiguration = this.model.get('bodyConfiguration');
            $(bodyConfiguration.get('selector')).css(bodyConfiguration.getStyleAttributes());
        }
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

exports.EditStyleFloorForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    serializeData: function(){

        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        data.type = 'Floor';

        data.bodyFields = this.model.get("bodyFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));

        return data;
    },

    addStyleValues: function(fields, configuration){
        _.each(fields, function(field) {
            if (configuration != null) {
                field.value = configuration.getStyleAttribute(field.id);
            } else {
                field.value = '';
            }
        });
    },

    extractStyle: function(formData, prefix, selector){

        var styleKeys = _.keys(formData);
        var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(prefix) == 0;
        }, this);

        var styleData = _.pick(formData, styleNames);
        var newStyleData = {};
        _.each(styleData, function(value, key){
            newStyleData[key.substr(prefix.length)] = value;
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("titleFields"), 'id'), _.pluck(this.model.get("bodyFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        var bodyConfigurationAttributes = this.extractStyle(data, this.model.bodyPrefix, this.model.bodySelector);

        var bodyConfiguration = this.model.get("bodyConfiguration");

        if (bodyConfiguration == null) {
            bodyConfiguration = new Configuration();
            this.model.set("bodyConfiguration", bodyConfiguration);
        }

        bodyConfiguration.set(bodyConfigurationAttributes);

        this.result = {
            status: "OK"
        }

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        }

        this.close();
    }
});