var app = require('app');
var roomsController = require('controllers/rooms');
var Room = require('models/room');
var Configuration = require('models/configuration');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-room-opts",

    events: {
        'click a.add-device': 'addDeviceTypeHandler',
        'click a#room-settings': 'editRoomHandler',
        'click a#editStyle': 'editStyle'
    },

    addDeviceTypeHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", this.model);
    },

    editRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:edit", roomsController.currentRoom);
    },

    editStyle: function() {
        app.vent.trigger("room:editStyle", this);
        return false;
    }
});

exports.RoomMoreOptionsView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    id: "room-more-opts",
    className: "hit-nav dropdown pull-right",
    template: "#room-more-options-template",

    events: {
        "click a.add-device-group": "addDeviceTypeClicked"
    },

    addDeviceTypeClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", this.model);
    }
});

exports.NoRoomsView = Backbone.Marionette.ItemView.extend({
    template: "#no-rooms-template"
});

exports.NoDeviceGroupView = Backbone.Marionette.ItemView.extend({
    template: "#no-device-group-template",
});

// Base view for device items in the list
exports.DeviceView = Backbone.Marionette.ItemView.extend({

    events: function(){
        var events = {
            "click .device-name a": "deviceClicked"
        };
        return _.extend(events, this.formEvents);
    },

    constructor: function(){
        Backbone.Marionette.ItemView.prototype.constructor.apply(this, arguments);
        this.model.addresses.each(function(address){
            var type = address.get("type");
            var address = address.get("address");
            if (/read.*/.test(type)){
                app.vent.trigger("device:read", address);
            }
        });
    },

    deviceClicked: function(e){
        e.preventDefault();
        app.vent.trigger("device:selected", this.model);
    },

    refreshIcon: function() {
    }
});

exports.SwitchDeviceView = exports.DeviceView.extend({

    template: "#device-list-switch-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "switchClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_switch");
        this.writeAddress = this.model.getAddressByType("write_switch");
    },

    switchClicked: function (e) {
        e.preventDefault();
        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateSwitch(on);
    },

    flipSwitch: function(on){
        var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", address, on);
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('selected');
        if (on) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(value);
    },

    onRender: function(){
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
    }

});

exports.DimmerDeviceView = exports.DeviceView.extend({

    template: "#device-list-dimmer-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "switchClicked",
        "change .dimmer": "dimmerChanged"
    },

    initialize: function(){
        this.readSwitch = this.model.getAddressByType("read_switch");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.readDimmer = this.model.getAddressByType("read_dimmer");
        this.writeDimmer = this.model.getAddressByType("write_dimmer");

        this.bindTo(this.readDimmer, "change:value", this.selectDimmer, this);
        this.bindTo(this.readSwitch, "change:value", this.selectSwitch, this);
    },

    switchClicked: function (e) {
        e.preventDefault();

        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateDimmerDetail((on) ? 100 : 0);
    },

    dimmerChanged: function(e){
        var $dimmer = $(e.currentTarget);
        var value = parseInt($dimmer.val());
        var address = this.writeDimmer.get("address");

        this.updateDimmerDetail(value);
        this.selectSwitch(address, (value !== 0));
        app.vent.trigger("device:write", address, value);

        /*var self = this;
        if (this.dimmerTimeout) {
            clearTimeout(this.dimmerTimeout);
        }
        this.dimmerTimeout = setTimeout(function() {
            self.dimmerTimeout = null;
        }, 500);*/
    },

    flipSwitch: function(on){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", address, on);
    },

    updateDimmerSlider: function(value) {
        $('.dimmer', this.$el).val(value);
    },

    updateDimmerDetail: function(value) {
        $('.dimmer-detail', this.$el).html(value + '%');
    },

    selectSwitch: function(address, value){
        $('a', this.$el).removeClass('selected');
        if (value) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(value);
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectDimmer: function(address, value){
        if (this.dimmerTimeout) return;

        var $dimmer = this.$(".dimmer");
        $dimmer.val(value);
    },

    onRender: function(){
        var value = this.readSwitch.get("value");
        this.selectSwitch(null, value);

        value = this.readDimmer.get("value");
        this.updateDimmerSlider(value);
        this.updateDimmerDetail(value);
    }
});

exports.ShutterDeviceView = exports.DeviceView.extend({

    template: "#device-list-shutter-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click a[data-value='up']": "upClicked",
        "click a[data-value='down']": "downClicked",
        "click a[data-value='stop']": "stopClicked",
        "change .dimmer": "positionChanged"
    },

    initialize: function(){
        this.readPosition = this.model.getAddressByType("read_position");
        this.writePosition = this.model.getAddressByType("write_position");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.writeStop = this.model.getAddressByType("write_stop");

        this.positionChanged = _.debounce(this.positionChanged, 500);

        this.bindTo(this.readPosition, "change:value", this.showPosition, this);
    },

    upClicked: function(e){
        e.preventDefault();
        this.switchUpDown(true);
    },

    downClicked: function(e){
        e.preventDefault();
        this.switchUpDown(false);
    },

    stopClicked: function(e){
        e.preventDefault();
        var address = this.writeStop.get("address");
        app.vent.trigger("device:write", address, 1);
    },

    positionChanged: function(e){
        var $position = $(e.currentTarget);
        var value = parseInt($position.val());
        var address = this.writePosition.get("address");
        app.vent.trigger("device:write", address, value);
        this.updateShutterDetails(value);
    },

    switchUpDown: function(moveDown){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", address, moveDown);
    },

    showPosition: function(address, value){
        this.$("input.dimmer").val(value);
        this.updateShutterDetails(value);
    },

    updateShutterDetails: function(shutterValue) {
        var maxValue = parseInt(this.$("input.dimmer").attr('max'));
        var shutterPercentage = Math.floor((shutterValue / maxValue) * 100);
        this.$('.shutter-detail').html(shutterPercentage + '%');
    },

    refreshIcon: function() {
        var $widget = $('.hit-icon', this.$el);
        app.changeIconState($widget, '#FFFFFF');
    },

    onRender: function(){
        var position = this.readPosition.get("value");
        this.showPosition(null, position);
    }

});

exports.ThermostatDeviceView = exports.DeviceView.extend({

    template: "#device-list-thermostat-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click a[data-mode]": "modeClicked",
        "click .thermostat-control a": "setpointChanged"
    },

    modes: {
        1: "comfort",
        2: "standby",
        3: "night",
        4: "frost"
    },

    modeNames: {
        1: "Comfort",
        2: "Standby",
        3: "Night",
        4: "Frost"
    },

    initialize: function(){
        this.writeMode = this.model.getAddressByType("write_mode");
        this.writeSetPoint = this.model.getAddressByType("write_temperature_set");

        this.readMode = this.model.getAddressByType("read_mode");
        this.readSetPoint = this.model.getAddressByType("read_temperature_set");
        this.readTemperature = this.model.getAddressByType("read_temperature_actual");

        this.bindTo(this.readMode, "change:value", this.showMode, this);
        this.bindTo(this.readSetPoint, "change:value", this.showSetPoint, this);
        this.bindTo(this.readTemperature, "change:value", this.showTemperature, this);
    },

    modeClicked: function(e){
        e.preventDefault();
        var mode = $(e.currentTarget).data("mode");
        var address = this.writeMode.get("address");
        app.vent.trigger("device:write", address, mode);

        this.updateModeButton(mode);
    },

    updateModeButton: function(mode) {
        this.$('a[data-mode]').removeClass('selected');
        this.$('a[data-mode="' + mode + '"]').addClass('selected');
    },

    setpointChanged: function(e){
        e.preventDefault();
        var $control = $(e.currentTarget);

        var address = this.writeSetPoint.get("address");

        var changeTemp = ($control.data('value') === 'minus') ? parseFloat("-0.5") : parseFloat("0.5");

        var currentPoint = app.eibdToDecimal(this.readSetPoint.get("value"));
        var setpoint = app.decimalToEibd(currentPoint + changeTemp);

        app.vent.trigger("device:write", address, setpoint);
    },

    showMode: function(address, mode){
        this.updateModeButton(mode);
    },

    showSetPoint: function(address, setPoint){
        var decimal = app.eibdToDecimal(setPoint);

        console.log("setpoint eibd value: ", setPoint);
        console.log("setpoint decimal value: ", decimal);

        this.$(".setpoint").html(decimal + "&nbsp;");
    },

    showTemperature: function(address, temperature){
        var decimal = app.eibdToDecimal(temperature);

        console.log("temperature eibd value: ", temperature);
        console.log("temperature decimal value: ", decimal);

        this.$(".temperature").html(decimal + "&nbsp;");
    },

    updateIconColor: function(value) {
        var $widget = $('.hit-icon', this.$el);
        app.changeIconState($widget, '#FFFFFF');
    },

    refreshIcon: function() {
        this.updateIconColor();
    },

    onRender: function(){
        var mode = this.readMode.get("value");
        this.showMode(null, mode);

        var setPoint = this.readSetPoint.get("value");
        this.showSetPoint(null, setPoint);

        var temperature = this.readTemperature.get("value");
        this.showTemperature(null, temperature);

        this.updateIconColor();
    }
});

exports.DoorDeviceView = exports.DeviceView.extend({

    template: "#device-list-door-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.updateStatus, this);
        this.readAddress = this.model.getAddressByType("read_door");
    },

    updateSwitch: function(on) {
        this.$('a').removeClass('active');
        if (on) {
            this.$('a.open').addClass('active');
        } else {
            this.$('a.open').removeClass('active');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = this.$('.hit-icon');
        if (on) {
            $widget.data('hit-icon-type',"devices.doorOpen");
            app.changeIconState($widget, 'white');
        } else {
            $widget.data('hit-icon-type',"devices.doorClose");
            app.changeIconState($widget, 'gray');
        }
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.updateStatus(null, value);
    },

    updateStatus: function(address, value){
        this.updateSwitch(value);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.WindowDeviceView = exports.DeviceView.extend({

    template: "#device-list-window-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.updateStatus, this);
        this.readAddress = this.model.getAddressByType("read_window");
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('active');
        if (on) {
            $('a.open', this.$el).addClass('active');
        } else {
            $('a.open', this.$el).removeClass('active');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            $widget.data('hit-icon-type',"devices.windowOpen");
            app.changeIconState($widget, 'white');
        } else {
            $widget.data('hit-icon-type',"devices.windowClose");
            app.changeIconState($widget, 'gray');
        }
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.updateStatus(null, value);
    },

    updateStatus: function(address, value){
        this.updateSwitch(value);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.SocketDeviceView = exports.DeviceView.extend({

    template: "#device-list-socket-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "socketClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_socket");
        this.writeAddress = this.model.getAddressByType("write_socket");
    },

    socketClicked: function (e) {
        e.preventDefault();
        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateSwitch(on);
    },

    flipSwitch: function(on){
        var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", address, on);
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('selected');
        if (on) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(value);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.DeviceGroupView = Backbone.Marionette.CompositeView.extend({
    template: "#device-group-template",
    className: "room-device-group span6 clearfix",
    
    events: {
        "click .addDevice": "addDeviceClicked",
        "click a#editDeviceGroupStyle": "editDeviceGroupClicked"
    },

    itemViewTypes: {
        "switch": exports.SwitchDeviceView,
        "dimmer": exports.DimmerDeviceView,
        "thermostat": exports.ThermostatDeviceView,
        "shutter": exports.ShutterDeviceView,
        "door": exports.DoorDeviceView,
        "window": exports.WindowDeviceView,
        "socket": exports.SocketDeviceView
    },

    initialize: function() {
        var type = this.model.get("type");

        this.collection = this.model.devices;
        this.itemView = this.itemViewTypes[type];

        // Bind event when the devices are removed to check if there devices in the collection
        this.bindTo(this, "item:removed", this.checkEmptyCollection, this);      
    },

    onRender: function() {
        this.applyStyles();
    },

    getViewId: function() {
        var prefix = "#device-group-";
        return prefix + this.model.get("type");
    },

    addDeviceClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:device:addToGroup", roomsController.currentRoom, this.model);
    },

    editDeviceGroupClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:editDeviceGroup", this);
    },

    appendHtml: function(cv, iv){
        cv.$(".device-list").append(iv.el);
        this.applyStyles();

        //app.loadIcons(iv.$el);

        // If the scroll bar component is created, update it
        /*if (this.scrollBar) {
            this.updateScrollBar();
        }*/
    },

    checkEmptyCollection: function() {
        if (this.collection.length == 0) {
            this.trigger('room:device-group:empty', this);
        } else {
            // this.updateScrollBar();
        }
    },

    applyStyle: function(styleConfigurationName, context, applySelector, createStylesheet) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            var that = this;
            _.each(selectorArray, function(selector){
                var fullSelector = selector;
                if (context) {
                    fullSelector = context + ' ' + selector;
                }
                that.$(fullSelector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    var classesToRemove = _.pluck(app.colorClasses, 'value').join(' ');
                    that.$(fullSelector).removeClass(classesToRemove).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(fullSelector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(fullSelector).css(configuration.getStyleAttributes());    
                }
            });
        }
    },

    applyStyles: function() {

        this.applyStyle('bodyConfiguration', this.getViewId(), true, true);
        this.applyStyle('titleConfiguration', this.getViewId(), true);

        _.each(_.values(this.children), function(itemView){
            itemView.refreshIcon();
        });

    },

    initializeScrollBar: function() {
        // this.scrollBar = this.$('.scroll-panel').tinyscrollbar();
    },

    updateScrollBar: function() {
        // $('.scroll-panel', this.$el).tinyscrollbar_update();
    }
});

exports.RoomLayout = Backbone.Marionette.CompositeView.extend({

    template: "#room-layout-template",
    id: "room-layout",
    itemView: exports.DeviceGroupView,

    events: {
        "click a.view-home": "viewClicked"
    },

    viewClicked: function(e){
        app.vent.trigger("home:view", this.model);
    },

    serializeData: function(){
        var data = Backbone.Marionette.CompositeView.prototype.serializeData.apply(this, arguments);
        var floor = this.model.collection.parentFloor;
        var home = floor.collection.parentHome;

        data.floor = floor.get("name");
        data.home = home.get("name");

        return data;
    },

    appendHtml: function(cv, iv){
        if (_.isUndefined(this.gridster)) {
            var $rowContainer = null;
            var $rows = cv.$(".room-devices");
            _.each($rows, function(row) {
                if ($('.room-device-group', row).length < 2) {
                    $rowContainer = $(row);
                }
            });

            if (!$rowContainer) {
                $container = $(cv.el);
                $rowContainer = $('<div class="room-devices row-fluid">').appendTo($container);
            }

            $rowContainer.append(iv.el);
        }
        // Initializes the scroll bar on the added device group
        //iv.initializeScrollBar();
    },

    onRender: function() {

        this.bindTo(this, "item:added", this.bindItemViewEvents, this);

        var that = this;
        // Bind event to remove device-group when there no devices of a type
        _.each(this.children, function(view, cid){
            that.bindItemViewEvents(view);
        });
    },

    applyStyle: function(styleConfigurationName) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            _.each(selectorArray, function(selector){
                $(selector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    this.$(selector).addClass(className);
                }
                this.$(selector).css(configuration.getStyleAttributes());
            });
        }
    },

    applyStyles: function() {
        this.applyStyle('bodyConfiguration');

        app.main.show(this);
        // app.loadIcons(this.$el);
    },

    bindItemViewEvents: function(itemView) {
        this.bindTo(itemView, 'room:device-group:empty', this.removeDeviceGroup, this);
    },

    removeDeviceGroup: function(deviceGroupView) {
        deviceGroupView.model.destroy();
        deviceGroupView.close();
    },

    initializeUIEffects: function() {

        // Initialize the scroll bar component for the device groups
        _.each(this.children, function(view, cid){
            view.initializeScrollBar();
        });
    }
});

exports.AddRoomForm = Backbone.Marionette.ItemView.extend({
    template: "#room-add-template",
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

        var data = Backbone.FormHelpers.getFormData(this);
        var room = new Room(data);

        this.trigger("save", room);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    } 
});

exports.EditRoomForm = Backbone.Marionette.ItemView.extend({

    template: "#room-edit-template",

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

        var room = this.model;
        var data = Backbone.FormHelpers.getFormData(this);

        room.set({
            name: data.name,
            icon: data.icon
        });
        this.trigger("save", room);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }    
});

exports.EditStyleRoomForm = Backbone.Marionette.ItemView.extend({

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

        data.type = 'Room';
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