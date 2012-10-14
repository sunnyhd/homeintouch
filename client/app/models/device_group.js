var app = require('app');
var BaseModel = require('models/base');
var Devices = require('collections/devices');
var Configuration = require('models/configuration');
var deviceTypesController = require('controllers/device_types');

module.exports = BaseModel.extend({

    defaults: {
        "widgetSize": "small"
    },

    titleSelector: '.hit-title',

    titlePrefix: 'title-',

    bodySelector: {selector: ['.hit-icon', '.device-btn', '.device-btn a']},

    bodyPrefix: 'body-',

    titleFields: [
        {name: "Background Color", id: "title-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Text Color", id: "title-color"}, 
        {name: "Opacity", id: "title-opacity"}
    ],

    titleDefaultStyle: {
        'class-background-image': 'blue'
    },

    bodyFields: [
        {name: "Background Color", id: "body-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Text Color", id: "body-color"}, 
        {name: "Opacity", id: "body-opacity"}
    ],

    bodyDefaultStyle: {
        'class-background-image': 'blue'
    },

    initialize: function(){
        this.devices = this.parseChildren("devices", Devices);
        this.setDeviceType();

        // Initialize Body Configuration
        var bodyConfiguration = new Configuration();
        if (this.has("bodyConfiguration")) {
            bodyConfiguration.set(this.get("bodyConfiguration"));
        }

        bodyConfiguration.set('selector', this.bodySelector);
        bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
        this.set("bodyConfiguration", bodyConfiguration);

        // Initialize Title Configuration
        var titleConfiguration = new Configuration();
        if (this.has("titleConfiguration")) {
            titleConfiguration.set(this.get("titleConfiguration"));
        }

        titleConfiguration.set('selector', this.titleSelector);
        titleConfiguration.set('defaultStyle', this.titleDefaultStyle);
        this.set("titleConfiguration", titleConfiguration);

        this.set("titleFields", _.clone(this.titleFields));
        this.set("bodyFields", _.clone(this.bodyFields));
    },

    setDeviceType: function(){
        var typeName = this.get("type");
        var type = deviceTypesController.getByType(typeName);

        if (type){
            this.deviceType = type;
            this.set("name", type.get("name"));
            this.set("widgetSize", type.get("widgetSize"));
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