var app = require('app');
var Room = require('models/room');

module.exports = Backbone.Collection.extend({

    model: Room,

    defaultRoom: function() {
        return this.at(0);
    },

    select: function(room){
        app.vent.trigger("room:selected", room);
    }
});