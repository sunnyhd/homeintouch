var BaseModel = require('models/base');
var Devices = require('collections/devices');
var Configuration = require('models/configuration');
var deviceTypesController = require('controllers/device_types');

module.exports = BaseModel.extend({

    titleFields: {"Title Background Color" : "title-background-color", "Title Text Color" : "title-color"},

    titleSelector: '.device-group-name',

    titlePrefix: 'title-',

    bodySelector: '.scroll-panel',

    bodyPrefix: 'body-',

    initialize: function(){
        this.devices = this.parseChildren("devices", Devices);
        this.setDeviceType();
        this.titleConfiguration = new Configuration(this.titleConfiguration);
        this.set("titleConfiguration", this.titleConfiguration);
        this.set("titleFields", this.titleFields);
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

        if (this.has("titleConfiguration")) {
            json.titleConfiguration = this.get("titleConfiguration").toJSON();
        }
        
        return json;
    }

});