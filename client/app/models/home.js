var app = require('app');
var BaseModel = require('models/base');
var Room = require('models/room');
var Floors = require('collections/floors');
var Configuration = require('models/configuration');
var HouseWidgets = require('collections/house_widgets');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
        'startPageTimeout': '0'
    },
  
    urlRoot: '/api/homes',

    // Body 
    bodySelector: 'body',
    bodyPrefix: 'body-',
    bodyFields: [
        {name: "Background Color", id: "body-background-color", type: "text"}, 
        {name: "Text Color", id: "body-color", type: "text"}, 
        {name: "Opacity", id: "body-opacity", type: "text"},
        {name: "Background Image", id: "body-background-image", type: "file"}
    ],
    bodyDefaultStyle: { 'background-image': 'none' },
    // Use to add a particular fixed style when a parameter is set.
    bodyFixedStyle: { 'background-image': {'background-size' : 'cover', 'background-attachment': 'fixed'} }, 

    // Body pattern
    bodyPatternSelector: 'body',
    bodyPatternPrefix: 'pattern-',
    bodyPatternDefaultStyle: { 'background-image': 'none' },
    bodyPatternFields: [
        {name: "Background Pattern", id: "pattern-background-image", type: "list", options: app.backgroundPatterns}
    ],

    // Favorites Body
    favoritesSelector: 'body',
    favoritesPrefix: 'body-',
    favoritesFields: [
        {name: "Background Color", id: "body-background-color", type: "text"}, 
        {name: "Text Color", id: "body-color", type: "text"}, 
        {name: "Opacity", id: "body-opacity", type: "text"},
        {name: "Background Image", id: "body-background-image", type: "file"}
    ],
    favoritesDefaultStyle: { 'background-image': 'none' },
    // Use to add a particular fixed style when a parameter is set.
    favoritesFixedStyle: { 'background-image': {'background-size' : 'cover', 'background-attachment': 'fixed'} }, 

    // Favorite widget body and title
    favoritesTitleSelector: '.hit-title',

    favoritesTitlePrefix: 'widget-title-',

    favoritesBodySelector: '.hit-icon',

    favoritesBodyPrefix: 'widget-body-',

    favoritesTitleFields: [
        {name: "Background Color", id: "widget-title-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Text Color", id: "widget-title-color"}, 
        {name: "Opacity", id: "widget-title-opacity"}
    ],

    favoritesTitleDefaultStyle: {
        'class-background-image': 'blue'
    },

    favoritesBodyFields: [
        {name: "Background Color", id: "widget-body-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Text Color", id: "widget-body-color"}, 
        {name: "Opacity", id: "widget-body-opacity"}
    ],

    favoritesBodyDefaultStyle: {
        'class-background-image': 'blue'
    },

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
        bodyPatternConfiguration.set('defaultStyle', this.bodyPatternDefaultStyle);
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

        // Initialize Favorites Body Configuration
        var favoritesConfiguration = new Configuration();
        if (this.has("favoritesConfiguration")) {
            favoritesConfiguration.set(this.get("favoritesConfiguration"));
        }
        favoritesConfiguration.set('selector', this.favoritesSelector);
        favoritesConfiguration.set('defaultStyle', this.favoritesDefaultStyle);
        favoritesConfiguration.set('fixedStyle', this.favoritesFixedStyle);
        this.set("favoritesConfiguration", favoritesConfiguration);

        // Initialize Favorites Widget Title Configuration
        var favoritesTitleConfiguration = new Configuration();
        if (this.has("favoritesTitleConfiguration")) {
            favoritesTitleConfiguration.set(this.get("favoritesTitleConfiguration"));
        }
        favoritesTitleConfiguration.set('selector', this.favoritesTitleSelector);
        favoritesTitleConfiguration.set('defaultStyle', this.favoritesTitleDefaultStyle);
        favoritesTitleConfiguration.set('fixedStyle', this.favoritesTitleFixedStyle);
        this.set("favoritesTitleConfiguration", favoritesTitleConfiguration);

        // Initialize Favorites Widget Body Configuration
        var favoritesBodyConfiguration = new Configuration();
        if (this.has("favoritesBodyConfiguration")) {
            favoritesBodyConfiguration.set(this.get("favoritesBodyConfiguration"));
        }
        favoritesBodyConfiguration.set('selector', this.favoritesBodySelector);
        favoritesBodyConfiguration.set('defaultStyle', this.favoritesBodyDefaultStyle);
        favoritesBodyConfiguration.set('fixedStyle', this.favoritesBodyFixedStyle);
        this.set("favoritesBodyConfiguration", favoritesBodyConfiguration);

        // Initialize Start Page Configuration
        if (!this.has('startPage')) {
            this.set('startPage', ('home-' + this.id));
        }

        this.set("bodyFields", _.clone(this.bodyFields));
        this.set("bodyPatternFields", _.clone(this.bodyPatternFields));
        this.set("timeWheaterFields", _.clone(this.timeWheaterFields));
        this.set("favoritesFields", _.clone(this.favoritesFields));

        this.set("favoritesTitleFields", _.clone(this.favoritesTitleFields));
        this.set("favoritesBodyFields", _.clone(this.favoritesBodyFields));
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

    getDefaultBackgroundStyle: function() {
        return this.get('bodyPatternConfiguration');
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

        // Sort device groups within the Favorites Page.
        if (this.has('favoritesWidgetOrder')) {
            favRoom.deviceGroups.favOrder = this.get('favoritesWidgetOrder');
            favRoom.deviceGroups.comparator = function(deviceGroup1, deviceGroup2) {
                var order1 = _.indexOf(this.favOrder, deviceGroup1.get('type'));
                var order2 = _.indexOf(this.favOrder, deviceGroup2.get('type'));
                
                if (order1 === -1) {
                    return 1;
                }
                if (order2 === -1) {
                    return -1;
                }
                
                if (order1 < order2) {
                    return -1;
                } else if (order1 > order2) {
                    return 1;
                } else {
                    return 0;
                }
            };
            favRoom.deviceGroups.sort({silent : true});
        }

        // Sort devices within each Device Group.
        _.each(favRoom.deviceGroups.models, function(deviceGroup) {
            var sortKey = 'sort-' + deviceGroup.get('type');
            if (this.has(sortKey)) {
                deviceGroup.devices.favOrder = this.get(sortKey);
                deviceGroup.devices.comparator = function(device1, device2) {
                    var order1 = _.indexOf(this.favOrder, device1.id);
                    var order2 = _.indexOf(this.favOrder, device2.id);
                    
                    if (order1 === -1) {
                        return 1;
                    }
                    if (order2 === -1) {
                        return -1;
                    }
                    
                    if (order1 < order2) {
                        return -1;
                    } else if (order1 > order2) {
                        return 1;
                    } else {
                        return 0;
                    }
                };

                deviceGroup.devices.sort({silent : true});
            }
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

        if (this.has("favoritesConfiguration")) {
            json.favoritesConfiguration = this.get("favoritesConfiguration").toJSON();
        }

        if (this.has("favoritesTitleConfiguration")) {
            json.favoritesTitleConfiguration = this.get("favoritesTitleConfiguration").toJSON();
        }

        if (this.has("favoritesBodyConfiguration")) {
            json.favoritesBodyConfiguration = this.get("favoritesBodyConfiguration").toJSON();
        }

        delete json.bodyFields;
        delete json.bodyPatternFields;
        delete json.timeWheaterDefaults;
        delete json.favoritesFields;
        delete json.favoritesTitleFields;
        delete json.favoritesBodyFields;

        return json;
    },

    destroy: function(options) {
        Backbone.Model.prototype.destroy.apply(this, [options]);
    }

});