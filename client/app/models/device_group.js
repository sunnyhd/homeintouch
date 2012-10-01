var BaseModel = require('models/base');
var Devices = require('collections/devices');
var Configuration = require('models/configuration');
var deviceTypesController = require('controllers/device_types');

module.exports = BaseModel.extend({

    titleSelector: '.device-group-name',

    titlePrefix: 'title-',

    bodySelector: '.scroll-panel',

    bodyPrefix: 'body-',
    
    titleFields: [
        {name: "Title Background Color", id: "title-background-color"}, 
        {name: "Title Text Color", id: "title-color"}, 
        {name: "Title Opacity", id: "title-opacity"}
    ],

    bodyFields: [
        {name: "Body Background Color", id: "body-background-color"}, 
        {name: "Body Text Color", id: "body-color"}, 
        {name: "Body Opacity", id: "body-opacity"}
    ],

    initialize: function(){
        this.devices = this.parseChildren("devices", Devices);
        this.setDeviceType();

        if (this.has("titleConfiguration")) {
            var titleConfiguration = new Configuration(this.get("titleConfiguration"));
            this.set("titleConfiguration", titleConfiguration);
        }

        if (this.has("bodyConfiguration")) {
            var bodyConfiguration = new Configuration(this.get("bodyConfiguration"));
            this.set("bodyConfiguration", bodyConfiguration);
        }

        this.set("titleFields", this.titleFields);
        this.set("bodyFields", this.bodyFields);
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

        if (this.has("bodyConfiguration")) {
            json.bodyConfiguration = this.get("bodyConfiguration").toJSON();
        }

        delete json.titleFields;
        delete json.bodyFields;
        
        return json;
    }

});