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

    applyStyle: function(styleConfigurationName, createStylesheet) {

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
                    var stylesheet = app.generateStylesheet(selector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(configuration.getStyleAttributes());    
                }
                
            });
        }
    },

    applyStyles: function() {
        this.applyStyle('bodyConfiguration', true);

        app.main.show(this);
        app.loadIcons(this.$el);
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

exports.EditStyleFloorForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile"
    },

    loadFile: function(event){
        var imageFile = event.target.files[0];
        this.previewFile(imageFile);
        
        var that = this;
        var fileName = imageFile.name;

        var reader = new FileReader();
        reader.onload = function (event) {
            that.imageStream = event.target.result;
            that.imageFileName = fileName;
        };

        reader.readAsBinaryString(imageFile);
    },

    previewFile: function(file) {
        
        var previewReader = new FileReader();
        previewReader.onload = function (event) {
            $('#holder').children().remove();
            var image = new Image();
            image.src = event.target.result;
            image.width = 150; // a fake resize
            holder.appendChild(image);
        };

        previewReader.readAsDataURL(file);        
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
            if (value != null && value != '') {
                newStyleData[key.substr(prefix.length)] = value;    
            }
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    updateStyleConfiguration: function(formData, prefix, selector, attributeName) {

        var configurationAttributes = this.extractStyle(formData, prefix, selector);

        var configuration = this.model.get(attributeName);

        if (configuration == null) {
            configuration = new Configuration();
            this.model.set(attributeName, configuration);
        }

        configuration.resetAttributes();

        configuration.set(configurationAttributes);
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("titleFields"), 'id'), _.pluck(this.model.get("bodyFields"), 'id'));

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

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {
            this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");

            this.result = {
                status: "OK"
            }

            this.close();
        }
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        }

        this.close();
    }
});