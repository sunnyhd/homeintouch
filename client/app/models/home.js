var BaseModel = require('models/base');
var Floors = require('collections/floors');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
    },
  
    urlRoot: '/api/homes',
    
    initialize: function(){
        this.floors = this.parseChildren("floors", Floors);
        this.floors.parentHome = this;
    },

    defaultFloor: function() {
        return this.floors.at(0);
    },

    getFloorById: function(id) {
        return this.floors.get(id);
    },

    addFloor: function(floor){
        this.floors.add(floor);
        this.trigger("change:floors", this.floors);
        this.trigger("change:floor:add", floor);
    },

    toJSON: function(){
        var json = BaseModel.prototype.toJSON.call(this);

        if (this.floors){
            json.floors = this.floors.toJSON();
        }

        return json;
    }

});