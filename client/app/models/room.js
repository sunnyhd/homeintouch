var BaseModel = require('models/base');
var DeviceGroups = require('collections/device_groups');
var DeviceGroup = require('models/device_group');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    bodySelector: 'body',

    bodyPrefix: 'body-',

    bodyFields: [
        {name: "Background Color", id: "body-background-color", type: "text"}, 
        {name: "Text Color", id: "body-color", type: "text"}, 
        {name: "Opacity", id: "body-opacity", type: "text"},
        {name: "Background Image", id: "body-background-image", type: "file"}
    ],

    bodyDefaultStyle: {
        'background-image': 'none'
    },

    // Use to add a particular fixed style when a parameter is set.
    bodyFixedStyle: {
        'background-image': {'background-size' : 'cover', 'background-attachment': 'fixed'}
    },

    defaults: {
        "addNew": "Add Room...",
        "icon": "rooms.room" // Default icon
    },

    initialize: function(){
        this.deviceGroups = this.parseChildren("deviceGroups", DeviceGroups);
        this.deviceGroups.parentRoom = this;
        this.parseInnerData();
    },

    findOrCreateGroup: function(deviceTypeName){
        var deviceGroup;

        deviceGroup = this.deviceGroups.find(function(dg){ 
            return dg.deviceType.get("type") == deviceTypeName;
        });
        if (!deviceGroup){
            deviceGroup = new DeviceGroup({ type: deviceTypeName });
        }
        return deviceGroup;
    },

    createGroup: function(deviceTypeName) {
        return new DeviceGroup({ type: deviceTypeName });
    },

    findGroup: function(deviceTypeName) {
        return this.deviceGroups.find(function(dg){ 
            return dg.deviceType.get("type") == deviceTypeName; 
        });
    },

    parseInnerData: function() {

        // Initialize Body Configuration
        var bodyConfiguration = new Configuration();
        if (this.has("bodyConfiguration")) {
            bodyConfiguration.set(this.get("bodyConfiguration"));
        }            

        bodyConfiguration.set('selector', this.bodySelector);
        bodyConfiguration.set('fixedStyle', this.bodyFixedStyle);
        bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
        this.set("bodyConfiguration", bodyConfiguration);

        this.set("bodyFields", _.clone(this.bodyFields));  
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.deviceGroups){
            json.deviceGroups = this.deviceGroups.toJSON();
        }

        if (this.has("bodyConfiguration")) {
            json.bodyConfiguration = this.get("bodyConfiguration").toJSON();
        }

        delete json.bodyFields;

        return json;
    }
    
});