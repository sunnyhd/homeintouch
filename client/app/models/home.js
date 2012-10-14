var app = require('app');
var BaseModel = require('models/base');
var Floors = require('collections/floors');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
    },
  
    urlRoot: '/api/homes',

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

    myHomeSelector: {context: '#my-house', selector: ['.hit-title', '.hit-icon']},

    myHomePrefix: 'my-house-',

    myHomeFields: [
        {name: "Text Color", id: "my-house-color"}, 
        {name: "Background Color", id: "my-house-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "my-house-opacity"}
    ],

    myHomeDefaultStyle: {
        'class-background-image': 'blue'
    },

    myLibrarySelector: {context: '#my-library', selector: ['.hit-title', '.hit-icon']},

    myLibraryPrefix: 'my-library-',

    myLibraryFields: [
        {name: "Text Color", id: "my-library-color"}, 
        {name: "Background Color", id: "my-library-class-background-color", type: "class-list", 
            options: [{label: "Dark Gray", value: "dark-gray"}, {label: "Gray", value: "gray"}, 
                      {label: "Dark Blue", value: "dark-blue"}, {label: "Blue", value: "blue"}, 
                      {label: "Yellow", value: "yellow"}, {label: "Dark Yellow", value: "dark-yellow"},
                      {label: "Violet", value: "violet"}]}, 
        {name: "Opacity", id: "my-library-opacity"}
    ],

    myLibraryDefaultStyle: {
        'class-background-image': 'blue'
    },
    
    initialize: function() {
        this.parseInnerData();
    },

    parseInnerData: function() {
        this.floors = this.parseChildren("floors", Floors);
        this.floors.parentHome = this;

        // Initialize Body Configuration
        var bodyConfiguration = new Configuration();
        if (this.has("bodyConfiguration")) {
            bodyConfiguration.set(this.get("bodyConfiguration"));
        }

        bodyConfiguration.set('selector', this.bodySelector);
        bodyConfiguration.set('defaultStyle', this.bodyDefaultStyle);
        this.set("bodyConfiguration", bodyConfiguration);

        // Initialize My Home Configuration
        var myHomeConfiguration = new Configuration();
        if (this.has("myHomeConfiguration")) {
            myHomeConfiguration.set(this.get("myHomeConfiguration"));
        }            

        myHomeConfiguration.set('selector', this.myHomeSelector);
        myHomeConfiguration.set('defaultStyle', this.myHomeDefaultStyle);
        this.set("myHomeConfiguration", myHomeConfiguration);
        
        // Initialize My Library Configuration
        var myLibraryConfiguration = new Configuration();
        if (this.has("myLibraryConfiguration")) {
            myLibraryConfiguration.set(this.get("myLibraryConfiguration"));
        }
        
        myLibraryConfiguration.set('selector', this.myLibrarySelector);
        myLibraryConfiguration.set('defaultStyle', this.myLibraryDefaultStyle);
        this.set("myLibraryConfiguration", myLibraryConfiguration);

        this.set("bodyFields", _.clone(this.bodyFields));  
        this.set("myHomeFields", _.clone(this.myHomeFields));
        this.set("myLibraryFields", _.clone(this.myLibraryFields));
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

        if (this.has("myHomeConfiguration")) {
            json.myHomeConfiguration = this.get("myHomeConfiguration").toJSON();
        }

        if (this.has("myLibraryConfiguration")) {
            json.myHomeConfiguration = this.get("myLibraryConfiguration").toJSON();
        }

        delete json.bodyFields;
        delete json.myHomeFields;

        return json;
    }

});