var BaseModel = require('models/base');
var Rooms = require('collections/rooms');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Floor...",
    },

    initialize: function(){
        this.rooms = this.parseChildren("rooms", Rooms);
        this.rooms.parentFloor = this;
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

        return json;
    }

});