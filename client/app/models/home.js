var app = require('app');
var BaseModel = require('models/base');
var Floors = require('collections/floors');
var Configuration = require('models/configuration');

module.exports = BaseModel.extend({

    defaults: {
        "addNew": "Add Home...",
    },
  
    urlRoot: '/api/homes',

    // Body 
    bodySelector: 'body:before',
    bodyPrefix: 'body-',
    bodyFields: [
        {name: "Background Color", id: "body-background-color", type: "text"}, 
        {name: "Text Color", id: "body-color", type: "text"}, 
        {name: "Opacity", id: "body-opacity", type: "text"},
        {name: "Background Image", id: "body-background-image", type: "file"}
    ],
    bodyDefaultStyle: { 'background-image': 'none' },
    bodyFixedStyle: { 'background-image': {'background-size' : 'cover'} }, // Use to add a particular fixed style when a parameter is set.

    // My Home
    myHomeSelector: {context: '#my-house', selector: ['.hit-title', '.hit-icon']},
    myHomePrefix: 'my-house-',
    myHomeFields: [
        {name: "Text Color", id: "my-house-color"}, 
        {name: "Background Color", id: "my-house-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "my-house-opacity"}
    ],
    myHomeDefaultStyle: { 'class-background-image': 'blue' },

    // My Library
    myLibrarySelector: {context: '#my-library', selector: ['.hit-title', '.hit-icon']},
    myLibraryPrefix: 'my-library-',
    myLibraryFields: [
        {name: "Text Color", id: "my-library-color"}, 
        {name: "Background Color", id: "my-library-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "my-library-opacity"}
    ],
    myLibraryDefaultStyle: { 'class-background-image': 'blue' },

    // Time and Weather
    timeWheaterSelector: {context: '#time-wheater', selector: ['.hit-title', '.hit-icon']},
    timeWheaterPrefix: 'time-wheater-',
    timeWheaterFields: [
        {name: "Text Color", id: "time-wheater-color"}, 
        {name: "Background Color", id: "time-wheater-class-background-color", type: "class-list", options: app.colorClasses}, 
        {name: "Opacity", id: "time-wheater-opacity"},
        {name: "Location", id: "location"}
    ],
    timeWheaterDefaultStyle: { 'class-background-image': 'blue' },
    timeWheaterDefaults: {'location': 'EUR|DE|GM003|BERLIN', 'locationLabel': 'Berlin, DE'},
    
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
        bodyConfiguration.set('fixedStyle', this.bodyFixedStyle);
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

        // Initialize Time and Weather Configuration
        var timeWheaterConfiguration = new Configuration();
        if (this.has("timeWheaterConfiguration")) {
            timeWheaterConfiguration.set(this.get("timeWheaterConfiguration"));
        }            
        timeWheaterConfiguration.set('selector', this.timeWheaterSelector);
        timeWheaterConfiguration.set('defaultStyle', this.timeWheaterDefaultStyle);
        
        if (!timeWheaterConfiguration.has('location')) {
            timeWheaterConfiguration.set('location', this.timeWheaterDefaults['location']);
        }

        if (!timeWheaterConfiguration.has('locationLabel')) {
            timeWheaterConfiguration.set('locationLabel', this.timeWheaterDefaults['locationLabel']);
        }        
        this.set("timeWheaterConfiguration", timeWheaterConfiguration);

        this.set("bodyFields", _.clone(this.bodyFields));  
        this.set("myHomeFields", _.clone(this.myHomeFields));
        this.set("myLibraryFields", _.clone(this.myLibraryFields));
        this.set("timeWheaterFields", _.clone(this.timeWheaterFields));
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
            json.myLibraryConfiguration = this.get("myLibraryConfiguration").toJSON();
        }

        if (this.has("timeWheaterConfiguration")) {
            json.timeWheaterConfiguration = this.get("timeWheaterConfiguration").toJSON();
        }

        delete json.bodyFields;
        delete json.myHomeFields;
        delete json.myLibraryFields;
        delete json.timeWheaterFields;

        return json;
    }

});