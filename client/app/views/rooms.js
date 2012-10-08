var app = require('app');
var roomsController = require('controllers/rooms');
var Room = require('models/room');
var Configuration = require('models/configuration');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-room-opts",

    events: {
        'click a.add-device': 'addDeviceTypeHandler',
        'click a#editStyle': 'editStyle'
    },

    addDeviceTypeHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", this.model);
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
    }

});

exports.SwitchDeviceView = exports.DeviceView.extend({

    template: "#device-list-switch-item-template",
    className: "row-fluid device",

    formEvents: {
        "click .btn": "switchClicked"
    },

    initialize: function(){
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_switch");
        this.writeAddress = this.model.getAddressByType("write_switch");
    },

    switchClicked: function() {
        var btnSwitch = this.$('.btn');
        var on = !btnSwitch.hasClass('active');
        this.flipSwitch(on);
        this.updateSwitch(on);
    },

    flipSwitch: function(on){
        var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", address, on);
    },

    updateSwitch: function(on) {
        var btnSwitch = this.$('.btn');

        var onClass = 'btn-success active';
        var offClass = 'btn-danger';

        if (on) {
            btnSwitch.removeClass(offClass).addClass(onClass);
        } else {
            btnSwitch.removeClass(onClass).addClass(offClass);
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
    className: "row-fluid device",

    formEvents: {
        "click .switch .btn.on": "switchOnClicked",
        "click .switch .btn.off": "switchOffClicked",
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

    switchOnClicked: function(){
        this.flipSwitch(true);
    },

    switchOffClicked: function(){
        this.flipSwitch(false);
    },

    dimmerChanged: function(e){
        var $dimmer = $(e.currentTarget);
        var value = parseInt($dimmer.val());
        var address = this.writeDimmer.get("address");
        app.vent.trigger("device:write", address, value);

        var self = this;

        if (this.dimmerTimeout) {
            clearTimeout(this.dimmerTimeout);
        }

        this.dimmerTimeout = setTimeout(function() {
            self.dimmerTimeout = null;
        }, 500);
    },

    flipSwitch: function(on){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", address, on);
    },

    selectSwitch: function(address, value){
        var $btnSwitch;
        if (value){
            $btnSwitch = this.$(".switch .btn.on");
        } else {
            $btnSwitch = this.$(".switch .btn.off");
        }
        $btnSwitch.button("toggle");
    },

    selectDimmer: function(address, value){
        if (this.dimmerTimeout) return;

        var $dimmer = this.$(".dimmer");
        $dimmer.val(value);
    },

    onRender: function(){
        var value = this.readSwitch.get("value");
        this.selectSwitch(null, value);
    }
});

exports.ShutterDeviceView = exports.DeviceView.extend({

    template: "#device-list-shutter-item-template",
    className: "row-fluid device",

    formEvents: {
        "click .up": "upClicked",
        "click .down": "downClicked",
        "click .stop": "stopClicked",
        "change .position": "positionChanged"
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
        this.switchUpDown(false);
    },

    downClicked: function(e){
        e.preventDefault();
        this.switchUpDown(true);
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
    },

    switchUpDown: function(moveDown){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", address, moveDown);
    },

    showPosition: function(address, value){
        this.$("input.position").val(value);
    },

    onRender: function(){
        var position = this.readPosition.get("value");
        this.showPosition(null, position);
    }

});

exports.ThermostatDeviceView = exports.DeviceView.extend({

    template: "#device-list-thermostat-item-template",
    className: "row-fluid device",

    formEvents: {
        "click .mode .btn": "modeClicked",
        "change .setpoint": "setpointChanged",
        "click .dropdown-menu a": "menuClicked"
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

    menuClicked: function(e) {
        var target = $(e.currentTarget);
        if (!target.parent().hasClass('disabled')) {
            var mode = target.data("mode");
            var address = this.writeMode.get("address");
            app.vent.trigger("device:write", address, mode);
            this.updateButtonName(mode);    
        } else {
            return false;
        }
    },

    updateButtonName: function(mode) {
        var buttonName = this.modeNames[mode];
        this.$('#label-button').text(buttonName);
        this.$('.dropdown-menu li > a[data-mode!="' + mode + '"]').parent().removeClass('disabled');
        this.$('.dropdown-menu li > a[data-mode="' + mode + '"]').parent().addClass('disabled');
    },

    modeClicked: function(e){
        e.preventDefault();
        var mode = $(e.currentTarget).data("mode");
        var address = this.writeMode.get("address");
        app.vent.trigger("device:write", address, mode);
    },

    setpointChanged: function(e){
        var address = this.writeSetPoint.get("address");

        var setpoint = $(e.currentTarget).val();
        setpoint = parseFloat(setpoint);
        setpoint = app.decimalToEibd(setpoint);

        app.vent.trigger("device:write", address, setpoint);
    },

    showMode: function(address, mode){
        this.updateButtonName(mode);
    },

    showSetPoint: function(address, setPoint){
        var decimal = app.eibdToDecimal(setPoint);

        console.log("setpoint eibd value: ", setPoint);
        console.log("setpoint decimal value: ", decimal);

        this.$("input.setpoint").val(decimal);
    },

    showTemperature: function(address, temperature){
        var decimal = app.eibdToDecimal(temperature);

        console.log("temperature eibd value: ", temperature);
        console.log("temperature decimal value: ", decimal);

        this.$("input.actual").val(decimal);
    },

    onRender: function(){
        var mode = this.readMode.get("value");
        this.showMode(null, mode);

        var setPoint = this.readSetPoint.get("value");
        this.showSetPoint(null, setPoint);

        var temperature = this.readTemperature.get("value");
        this.showTemperature(null, temperature);
    }
});

exports.DeviceGroupView = Backbone.Marionette.CompositeView.extend({

    template: "#device-group-template",

    className: "room-device-group span4",
    
    //tagName: 'li',

    events: {
        "click .addDevice": "addDeviceClicked",
        "click .editDeviceGroup": "editDeviceGroupClicked"
    },

    itemViewTypes: {
        "switch": exports.SwitchDeviceView,
        "dimmer": exports.DimmerDeviceView,
        "thermostat": exports.ThermostatDeviceView,
        "shutter": exports.ShutterDeviceView
    },

    initialize: function(){
        this.collection = this.model.devices;

        var type = this.model.get("type");
        this.itemView = this.itemViewTypes[type];

        // Bind event when the devices are removed to check if there devices in the collection
        this.bindTo(this, "item:removed", this.checkEmptyCollection, this);        
    },

    onRender: function() {
        this.applyStyles();
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
        // If the scroll bar component is created, update it
        if (this.scrollBar) {
            this.updateScrollBar();
        }
    },

    checkEmptyCollection: function() {
        if (this.collection.length == 0) {
            this.trigger('room:device-group:empty', this);
        } else {
            this.updateScrollBar();
        }
    },

    applyStyles: function() {
        if (this.model.has('titleConfiguration')) {
            var titleConfiguration = this.model.get('titleConfiguration');
            this.$(titleConfiguration.get('selector')).css(titleConfiguration.getStyleReset());
            this.$(titleConfiguration.get('selector')).css(titleConfiguration.getStyleAttributes());
        }

        if (this.model.has('bodyConfiguration')) {
            var bodyConfiguration = this.model.get('bodyConfiguration');
            this.$(bodyConfiguration.get('selector')).css(bodyConfiguration.getStyleReset());
            this.$(bodyConfiguration.get('selector')).css(bodyConfiguration.getStyleAttributes());
        }
    },

    initializeScrollBar: function() {
        this.scrollBar = this.$('.scroll-panel').tinyscrollbar();
    },

    updateScrollBar: function() {
        $('.scroll-panel', this.$el).tinyscrollbar_update();
    }
});

exports.RoomLayout = Backbone.Marionette.CompositeView.extend({

    template: "#room-layout-template",

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
                if ($('.room-device-group', row).length < 3) {
                    $rowContainer = $(row);
                }
            });

            if (!$rowContainer) {
                $container = $('.container-fluid', cv.el);
                $rowContainer = $('<div class="room-devices row-fluid">').appendTo($container);
            }

            $rowContainer.append(iv.el);
        }
        // Initializes the scroll bar on the added device group
        iv.initializeScrollBar();
    },

    onRender: function() {

        this.bindTo(this, "item:added", this.bindItemViewEvents, this);

        var that = this;
        // Bind event to remove device-group when there no devices of a type
        _.each(this.children, function(view, cid){
            that.bindItemViewEvents(view);
        });

        this.applyStyles();
    },

    applyStyles: function() {

        $(this.model.bodySelector).removeAttr('style');

        if (this.model.has('bodyConfiguration')) {
            var bodyConfiguration = this.model.get('bodyConfiguration');
            $(bodyConfiguration.get('selector')).css(bodyConfiguration.getStyleAttributes());
        }
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
    formFields: ["name"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
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

exports.EditStyleRoomForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
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