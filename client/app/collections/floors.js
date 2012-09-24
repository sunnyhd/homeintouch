var app = require('app');
var Floor = require('models/floor');

module.exports = Backbone.Collection.extend({

    model: Floor,

    defaultFloor: function() {
        return this.at(0);
    },

    select: function(floor){
        app.vent.trigger("floor:selected", floor);
    }
});