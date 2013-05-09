var app = require('app');
var floorsController = require('controllers/floors');
var Floor = require('models/floor');
var Configuration = require('models/configuration');
var StyleConfigurationView = require('views/settings/style_settings');

// Views
// -----

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-floor-opts",

    events: {
        'click a.add-room': 'addRoomHandler',
        'click a#floor-settings': 'editFloorHandler',
        'click a#editStyle': 'editStyle'
    },

    addRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:add");
    },

    editFloorHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("floor:edit", floorsController.currentFloor);
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

    initialize: function() {
        this.resizeHandler = $.proxy(this.updateScrollBar, this);
        $(window).on("resize", this.resizeHandler);
    },

    close: function() {
        $(window).off("resize", this.resizeHandler);  
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

    applyStyle: function(styleConfigurationName, createStylesheet, defaultStyleConfiguration) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            _.each(selectorArray, function(selector){
                $(selector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    $(selector).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(selector, configuration.getStyleAttributes(defaultStyleConfiguration));
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(configuration.getStyleAttributes(defaultStyleConfiguration));
                }
                
            });
        }
    },

    applyStyles: function() {

        var bodyPatternConfiguration = app.controller('homes').currentHome.getDefaultBackgroundStyle();
        this.applyStyle('bodyConfiguration', true, bodyPatternConfiguration);

        if (this.model.has('myRoomsConfiguration')) {
            var myRoomsModel = this.model.get('myRoomsConfiguration');
            this.applyStyle('myRoomsConfiguration');
            app.loadIcons(myRoomsModel.getSelectorContext(), myRoomsModel.getColor());
        } else {
            app.loadIcons('#my-rooms');
        }

        if (this.model.has('myRoomsTitleConfiguration')) {
            var myRoomsTitleModel = this.model.get('myRoomsTitleConfiguration');
            this.applyStyle('myRoomsTitleConfiguration');
        }

        this.initScrollBar();
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
    },

    initScrollBar: function() {
        var opts = { axis: 'x', invertscroll: app.isTouchDevice() };
        this.$el.find('#my-rooms').tinyscrollbar(opts);
    },

    updateScrollBar: function() {
        var $myRooms = this.$el.find('#my-rooms');
        var tsb = $myRooms.data('tsb');
        if ( $myRooms.length > 0 && tsb ) {
            $myRooms.tinyscrollbar_update();
        }
    },

    setScrollbarOverview: function() {
        var $widget = $('.hit-widget', this.$el);
        var $icons = $('.hit-icon', $widget);
        var width = 102;
        if ($widget.hasClass('large')) { width = 192; }
        else if ($widget.hasClass('medium')) { width = 147; } 
        else if ($widget.hasClass('small')) { width = 122; } 
        
        $('.overview', this.$el).setPixels('width', $icons.length * width);
    },

    onRender: function() {
        this.setScrollbarOverview();
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

    formFields: ["name", "rooms", "icon"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    serializeData: function(){
        var data = {};

        if (this.model) { 
            data = this.model.toJSON();
        }
        if (this.options.icons) { 
            data.icons = this.options.icons;
        }
        return data;
    },

    saveClicked: function(e){
        e.preventDefault();

        var data = Backbone.FormHelpers.getFormData(this);
        var roomNames = data.rooms.split(","); delete data.rooms;
        
        var rooms = [];
        
        for(var i = 0, length = roomNames.length; i<length; i++){
            var roomName = $.trim(roomNames[i]);
            if (roomName !== '') {
                var room = {
                    name: roomName
                };
                rooms.push(room);
            }
        }

        var floor = new Floor({
            name: data.name,
            rooms: rooms,
            icon: data.icon
        });

        this.trigger("save", floor);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }    
});

exports.EditFloorForm = Backbone.Marionette.ItemView.extend({

    template: "#floor-edit-template",

    formFields: ["name", "icon"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    serializeData: function(){
        var data = {};

        if (this.model) { 
            data = this.model.toJSON();
        }
        if (this.options.icons) { 
            data.icons = this.options.icons;
        }
        return data;
    },

    saveClicked: function(e){
        e.preventDefault();

        var floor = this.model;
        var data = Backbone.FormHelpers.getFormData(this);

        floor.set({
            name: data.name,
            icon: data.icon
        });
        this.trigger("save", floor);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }    
});

exports.EditStyleFloorForm = StyleConfigurationView.extend({

    template: "#edit-floor-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile",
        "click a#clear-background" : "clearBackgroundClicked"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.type = 'Floor';

        data.bodyFields = this.model.get("bodyFields");
        data.myRoomsFields = this.model.get("myRoomsFields");
        data.myRoomsTitleFields = this.model.get("myRoomsTitleFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.myRoomsFields, this.model.get("myRoomsConfiguration"));
        this.addStyleValues(data.myRoomsTitleFields, this.model.get("myRoomsTitleConfiguration"));

        return data;
    },

    clearStyleModel: function() {
        StyleConfigurationView.prototype.clearStyleModel.apply(this);
        this.model.get('bodyConfiguration').unsetFileAttribute();
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("titleFields"), 'id'), _.pluck(this.model.get("bodyFields"), 'id'), _.pluck(this.model.get("myRoomsFields"), 'id'), _.pluck(this.model.get("myRoomsTitleFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        if (this.imageStream) {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/api/images",
                data: {
                    fileName: that.imageFileName,
                    fileStream: that.imageStream
                },
                success: function (response) {
                    var imagePath = response.imagePath;
                    data['body-background-image'] = 'url(' + imagePath + ')';
                    that.updateStyleConfiguration(data, that.model.bodyPrefix, that.model.bodySelector, "bodyConfiguration");
                    that.updateStyleConfiguration(data, that.model.myRoomsPrefix, that.model.myRoomsSelector, "myRoomsConfiguration");
                    that.updateStyleConfiguration(data, that.model.myRoomsTitlePrefix, that.model.myRoomsTitleSelector, "myRoomsTitleConfiguration");

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {
            this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");
            this.updateStyleConfiguration(data, this.model.myRoomsPrefix, this.model.myRoomsSelector, "myRoomsConfiguration");
            this.updateStyleConfiguration(data, this.model.myRoomsTitlePrefix, this.model.myRoomsTitleSelector, "myRoomsTitleConfiguration");

            this.result = {
                status: "OK"
            }

            this.close();
        }
    }
});