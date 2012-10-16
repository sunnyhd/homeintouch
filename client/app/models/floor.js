var BaseModel = require('models/base');
var Rooms = require('collections/rooms');
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
        'background-image': {'background-size' : 'cover'} 
    },

    defaults: {
        "addNew": "Add Floor...",
        "icon": "floors.floor" // Default icon
    },

    initialize: function(){
        this.rooms = this.parseChildren("rooms", Rooms);
        this.rooms.parentFloor = this;

        this.parseInnerData();
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

    defaultRoom: function() { 
        return this.rooms.at(0);
    },

    getRoomById: function(id) {
        return this.rooms.get(id);
    },

    addRoom: function(room){
        this.rooms.add(room);
        this.trigger("change:rooms", this.rooms);
        this.trigger("change:room:add", room);
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);
        
        if (this.rooms){
            json.rooms = this.rooms.toJSON();
        }

        if (this.has("bodyConfiguration")) {
            json.bodyConfiguration = this.get("bodyConfiguration").toJSON();
        }

        delete json.bodyFields;

        return json;
    }

});