var BaseModel = require('models/base');
var Rooms = require('collections/rooms');

module.exports = BaseModel.extend({

    initialize: function(){
        this.rooms = this.parseChildren("rooms", Rooms);
        this.rooms.parentFloor = this;
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