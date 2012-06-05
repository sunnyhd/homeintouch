var BaseModel = require('models/base');
var DeviceGroups = require('collections/device_groups');
var DeviceGroup = require('models/device_group');

module.exports = BaseModel.extend({

    initialize: function(){
        this.deviceGroups = this.parseChildren("deviceGroups", DeviceGroups);
        this.deviceGroups.parentRoom = this;
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

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.deviceGroups){
            json.deviceGroups = this.deviceGroups.toJSON();
        }

        return json;
    }
    
});