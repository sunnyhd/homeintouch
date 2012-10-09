var BaseModel = require('models/base');
var Rooms = require('collections/rooms');
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
        "addNew": "Add Floor...",
    },

    initialize: function(){
        this.rooms = this.parseChildren("rooms", Rooms);
        this.rooms.parentFloor = this;

        this.parseInnerData();
    },

    parseInnerData: function() {

        if (this.has("bodyConfiguration")) {
            var bodyConfiguration = new Configuration(this.get("bodyConfiguration"));
            bodyConfiguration.set('selector', this.bodySelector);
            bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
            this.set("bodyConfiguration", bodyConfiguration);
        }

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