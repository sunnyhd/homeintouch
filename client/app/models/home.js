var app = require('app');
var BaseModel = require('models/base');
var Room = require('models/room');
var Floors = require('collections/floors');
var Configuration = require('models/configuration');
var HouseWidgets = require('collections/house_widgets');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
    },
  
    urlRoot: '/api/homes',

    // Body 
    bodySelector: 'body:before',
    bodyPrefix: 'body-',
    bodyFields: [
        {name: "Background Color", id: "body-background-color", type: "text"}, 
        {name: "Text Color", id: "body-color", type: "text"}, 
        {name: "Opacity", id: "body-opacity", type: "text"},
        {name: "Background Image", id: "body-background-image", type: "file"}
    ],
    bodyDefaultStyle: { 'background-image': 'none' },
    bodyFixedStyle: { 'background-image': {'background-size' : 'cover'} }, // Use to add a particular fixed style when a parameter is set.

    // Body pattern
    bodyPatternSelector: 'body',
    bodyPatternPrefix: 'pattern-',
    bodyPatternFields: [
        {name: "Background Pattern", id: "pattern-background-image", type: "list", options: app.backgroundPatterns}
    ],

    // Time and Weather
    timeWheaterDefaults: {'location': 'EUR|DE|GM003|BERLIN', 'locationLabel': 'Berlin, DE'},
    
    initialize: function() {
        this.parseInnerData();
    },

    parseInnerData: function() {
        this.floors = this.parseChildren("floors", Floors);
        this.floors.parentHome = this;

        if (this.has("widgets")) {
            this.widgets = this.parseChildren("widgets", HouseWidgets);
        } else {
            this.initializeWidgets();
        }

        this.widgets.parentHome = this;

        // Initialize Body Configuration
        var bodyConfiguration = new Configuration();
        if (this.has("bodyConfiguration")) {
            bodyConfiguration.set(this.get("bodyConfiguration"));
        }
        bodyConfiguration.set('selector', this.bodySelector);
        bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
        bodyConfiguration.set('fixedStyle', this.bodyFixedStyle);
        this.set("bodyConfiguration", bodyConfiguration);

        // Initialize Body Pattern Configuration
        var bodyPatternConfiguration = new Configuration();
        if (this.has("bodyPatternConfiguration")) {
            bodyPatternConfiguration.set(this.get("bodyPatternConfiguration"));
        }
        bodyPatternConfiguration.set('selector', this.bodyPatternSelector);
        //bodyPatternConfiguration.set('defaultStyle', this.bodyPatternDefaultStyle);
        this.set("bodyPatternConfiguration", bodyPatternConfiguration);

        // Initialize Time and Weather Configuration
        var timeWheaterConfiguration = new Configuration();
        if (this.has("timeWheaterConfiguration")) {
            timeWheaterConfiguration.set(this.get("timeWheaterConfiguration"));
        }            
        
        if (!timeWheaterConfiguration.has('location')) {
            timeWheaterConfiguration.set('location', this.timeWheaterDefaults['location']);
        }

        if (!timeWheaterConfiguration.has('locationLabel')) {
            timeWheaterConfiguration.set('locationLabel', this.timeWheaterDefaults['locationLabel']);
        }        
        this.set("timeWheaterConfiguration", timeWheaterConfiguration);

        this.set("bodyFields", _.clone(this.bodyFields));
        this.set("bodyPatternFields", _.clone(this.bodyPatternFields));
        this.set("timeWheaterFields", _.clone(this.timeWheaterFields));
    },

    initializeWidgets: function() {
        var houseWidgets = new HouseWidgets();

        var myHouse = {order: 0, visible: true, name: 'My House', type: 'my-house', template: '#my-house-template'};
        var myLibrary = {order: 1, visible: true, name: 'My Library', type: 'my-library', template: '#my-library-template'};
        var timeWheater = {order: 2, visible: true, name: 'Time & Wheater', type: 'time-wheater', template: '#time-wheater-template'};
        var recentlyAdded = {order: 3, visible: true, name: 'Recently Added', type: 'recently-added', template: '#recently-added-template'};

        houseWidgets.add(myHouse);
        houseWidgets.add(myLibrary);
        houseWidgets.add(timeWheater);
        houseWidgets.add(recentlyAdded);

        this.widgets = houseWidgets;
    },

    defaultFloor: function() {
        return this.floors.at(0);
    },

    getFloorById: function(id) {
        return this.floors.get(id);
    },

    addFloor: function(floor){
        this.floors.add(floor);
        this.trigger("change:floors", this.floors);
        this.trigger("change:floor:add", floor);
    },

    getFavorites: function() {
        var favRoom = new Room();
        favRoom.parentHome = this;

        _.each(this.floors.models, function (floor) {
            _.each(floor.rooms.models, function (room) {
                _.each(room.deviceGroups.models, function (deviceGroup) {

                    var type = deviceGroup.deviceType.get('type');
                    var favDeviceGrp = favRoom.findGroup(type);
                    if (!favDeviceGrp) {
                        favDeviceGrp = favRoom.createGroup(type);
                    }
                    var favDevices = _.filter(deviceGroup.devices.models, function(device) {
                        return device.isFavorite();
                    });

                    if (favDevices.length > 0) {
                        // Adds the favorite devices to the device group
                        favDeviceGrp.devices.add(favDevices);
                        favRoom.deviceGroups.add(favDeviceGrp);
                    }

                }, this);
            }, this);
        }, this);

        return favRoom;
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.floors){
            json.floors = this.floors.toJSON();
        }

        if (this.widgets){
            json.widgets = this.widgets.toJSON();
        }

        if (this.has("bodyConfiguration")) {
            json.bodyConfiguration = this.get("bodyConfiguration").toJSON();
        }

        if (this.has("bodyPatternConfiguration")) {
            json.bodyPatternConfiguration = this.get("bodyPatternConfiguration").toJSON();
        }

        if (this.has("timeWheaterConfiguration")) {
            json.timeWheaterConfiguration = this.get("timeWheaterConfiguration").toJSON();
        }

        delete json.bodyFields;
        delete json.bodyPatternFields;
        delete json.timeWheaterDefaults;

        return json;
    }

});