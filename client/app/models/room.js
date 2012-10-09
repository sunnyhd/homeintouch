var BaseModel = require('models/base');
var DeviceGroups = require('collections/device_groups');
var DeviceGroup = require('models/device_group');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    bodySelector: 'body',

    bodyPrefix: 'body-',

    bodyFields: [
        {name: "Background Color", id: "body-background-color"}, 
        {name: "Text Color", id: "body-color"}, 
        {name: "Opacity", id: "body-opacity"}
    ],

    bodyDefaultStyle: {
        'background-image': 'none'
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

    findOrCreateGroup: function(deviceType){
        var deviceGroup;

        deviceGroup = this.deviceGroups.find(function(dg){ 
            return dg.deviceType.get("type") == deviceType; 
        });

        if (!deviceGroup){
            deviceGroup = new DeviceGroup({ type: deviceType });
        }

        return deviceGroup;
    },

    parseInnerData: function() {

        if (this.has("bodyConfiguration")) {
            var bodyConfiguration = new Configuration(this.get("bodyConfiguration"));
            bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
            bodyConfiguration.set('selector', this.bodySelector);
            this.set("bodyConfiguration", bodyConfiguration);
        }

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