var BaseModel = require('models/base');
var Devices = require('collections/devices');
var deviceTypesController = require('controllers/device_types');

module.exports = BaseModel.extend({

    initialize: function(){
        this.devices = this.parseChildren("devices", Devices);
        this.setDeviceType();
    },

    setDeviceType: function(){
        var typeName = this.get("type");
        var type = deviceTypesController.getByType(typeName);

        if (type){
            this.deviceType = type;
            this.set("name", type.get("name"));
        }
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.devices){
            json.devices = this.devices.toJSON();
        }
        
        return json;
    }

});