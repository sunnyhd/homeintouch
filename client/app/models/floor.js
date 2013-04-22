var app = require('app');
var BaseModel = require('models/base');
var Rooms = require('collections/rooms');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    bodySelector: 'body:before',

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

    myRoomsSelector: {context: '#my-rooms', selector: ['.hit-icon']},

    myRoomsPrefix: 'my-rooms-',

    myRoomsFields: [
        {name: "Text Color", id: "my-rooms-color"}, 
        {name: "Background Color", id: "my-rooms-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "my-rooms-opacity"}
    ],

    myRoomsDefaultStyle: {
        'class-background-color': 'blue'
    },

    myRoomsTitleSelector: {context: '#my-rooms', selector: ['.hit-title']},

    myRoomsTitlePrefix: 'my-rooms-title-',

    myRoomsTitleFields: [
        {name: "Text Color", id: "my-rooms-title-color"}, 
        {name: "Background Color", id: "my-rooms-title-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "my-rooms-title-opacity"}
    ],

    myRoomsTitleDefaultStyle: {
        'class-background-color': 'blue'
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

        // Initialize My Rooms Configuration
        var myRoomsConfiguration = new Configuration();
        if (this.has("myRoomsConfiguration")) {
            myRoomsConfiguration.set(this.get("myRoomsConfiguration"));
        }            

        myRoomsConfiguration.set('selector', this.myRoomsSelector);
        myRoomsConfiguration.set('defaultStyle', this.myRoomsDefaultStyle);
        this.set("myRoomsConfiguration", myRoomsConfiguration);

        this.set("myRoomsFields", _.clone(this.myRoomsFields));  

        // Initialize My Rooms Title Configuration
        var myRoomsTitleConfiguration = new Configuration();
        if (this.has("myRoomsTitleConfiguration")) {
            myRoomsTitleConfiguration.set(this.get("myRoomsTitleConfiguration"));
        }            

        myRoomsTitleConfiguration.set('selector', this.myRoomsTitleSelector);
        myRoomsTitleConfiguration.set('defaultStyle', this.myRoomsTitleDefaultStyle);
        this.set("myRoomsTitleConfiguration", myRoomsTitleConfiguration);

        this.set("myRoomsTitleFields", _.clone(this.myRoomsTitleFields));  
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

        if (this.has("myRoomsConfiguration")) {
            json.myRoomsConfiguration = this.get("myRoomsConfiguration").toJSON();
        }

        if (this.has("myRoomsTitleConfiguration")) {
            json.myRoomsTitleConfiguration = this.get("myRoomsTitleConfiguration").toJSON();
        }

        delete json.bodyFields;
        delete json.myRoomsFields;
        delete json.myRoomsTitleFields;

        return json;
    }

});