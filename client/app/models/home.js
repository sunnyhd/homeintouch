var BaseModel = require('models/base');
var Floors = require('collections/floors');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
    },
  
    urlRoot: '/api/homes',

    bodySelector: '#main-content',

    bodyPrefix: 'body-',

    bodyFields: [
        {name: "Background Color", id: "body-background-color"}, 
        {name: "Text Color", id: "body-color"}, 
        {name: "Opacity", id: "body-opacity"}
    ],
    
    initialize: function() {
        this.parseInnerData();
    },

    parseInnerData: function() {
        this.floors = this.parseChildren("floors", Floors);
        this.floors.parentHome = this;

        if (this.has("bodyConfiguration")) {
            var bodyConfiguration = new Configuration(this.get("bodyConfiguration"));
            this.set("bodyConfiguration", bodyConfiguration);
        }

        this.set("bodyFields", _.clone(this.bodyFields));  
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

        if (this.has("bodyConfiguration")) {
            json.bodyConfiguration = this.get("bodyConfiguration").toJSON();
        }

        delete json.bodyFields;

        return json;
    }

});