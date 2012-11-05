var app = require('app');
var homesController = require('controllers/homes');
var Home = require('models/home');
var Configuration = require('models/configuration');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-home-opts",

    events: {
        'click a.add-floor': 'addFloorHandler',
        'click a#editStyle': 'editStyle'
    },

    addFloorHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

    editStyle: function() {
        app.vent.trigger("home:editStyle", this);
        return false;
    }
});

exports.SwitchSelectedHomeView = Backbone.Marionette.ItemView.extend({
    template: "#switch-selected-home-template",

    events: {
        "click .cancel": "closeClicked",
        "click .switch": "switchClicked",
        "click .addHome": "addHomeClicked"
    },

    /** Overrides original implementation */
    serializeData: function(){
        var data = {};

        if (this.model) { 
            data = this.model.toJSON();
        }
        if (this.options.homes) { 
            data.homes = this.options.homes.toJSON();
        }
        return data;
    },

    closeClicked: function(e){
        e.preventDefault();
        this.close();
    },

    switchClicked: function(e){
        e.preventDefault();
        var homeId = $('#selectedHome option:selected').val();
        var home = homesController.homes.get(homeId);
        app.vent.trigger("home:selected", home);
        this.close();
    },

    addHomeClicked: function(e){
        e.preventDefault();
        this.close();
        addNewHome();
    }
});

/** 
 * Home dashboard view.
 * */
exports.HomeDashboardView = Backbone.Marionette.ItemView.extend({
    template: "#dashboard-home",

    events: {
        "click .floor-item-list": "floorClicked",
        "click a.add-floor": "addFloorHandler"
    },

    initialize: function() {
        this.resizeHandler = $.proxy(this.updateScrollBar, this);
        $(window).on("resize", this.resizeHandler);
    },

    close: function() {
        $(window).off("resize", this.resizeHandler);  
    },

    floorClicked: function(e){
        e.preventDefault();
        var floorId = ($(e.currentTarget).data('item-id'));
        app.vent.trigger("floor:selected", this.model.getFloorById(floorId));
    },

    addFloorHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

    applyStyle: function(styleConfigurationName, createStylesheet) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            _.each(selectorArray, function(selector){
                $(selector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    $(selector).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(selector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(configuration.getStyleAttributes());    
                }
                
            });
        }
    },

    applyStyles: function() {

        app.hitIcons(this.$el);

        this.applyStyle('bodyConfiguration', true);

        if (this.model.has('myHomeConfiguration')) {
            var myHomeModel = this.model.get('myHomeConfiguration');
            this.applyStyle('myHomeConfiguration');
            app.loadIcons(myHomeModel.getSelectorContext(), myHomeModel.getColor());
        } else {
            app.loadIcons('#my-house');
        }
        
        if (this.model.has('myLibraryConfiguration')) {
            var myLibraryModel = this.model.get('myLibraryConfiguration');
            this.applyStyle('myLibraryConfiguration');
            app.loadIcons(myLibraryModel.getSelectorContext(), myLibraryModel.getColor());
        } else {
            app.loadIcons('#my-library');    
        }

        if (this.model.has('timeWheaterConfiguration')) {
            var timeWheaterModel = this.model.get('timeWheaterConfiguration');
            this.applyStyle('timeWheaterConfiguration');
        }
        
        this.initScrollBar();
    },

    initScrollBar: function() {
        var opts = { axis: 'x', invertscroll: app.isTouchDevice() };
        this.$el.find('.scrollable-x').tinyscrollbar(opts);
    },

    updateScrollBar: function() {
        var $containers = this.$el.find('.scrollable-x');
        _.each($containers, function(c) {
            $(c).tinyscrollbar_update();
        });
    },

    setScrollbarOverview: function() {
        var $scrollableContainers = this.$el.find('.scrollable-x');

        // For each scrollable container, sets the overview width
        _.each($scrollableContainers, function(container) {
            var $widget = $(container);
            var $icons = $('.hit-icon', $widget);
            var width = 102;
            if ($widget.hasClass('large')) { width = 192; }
            else if ($widget.hasClass('medium')) { width = 147; } 
            else if ($widget.hasClass('small')) { width = 122; } 
            
            $('.overview', $widget).setPixels('width', $icons.length * width);
        });
    },

    displayCurrentDate: function(date) {
        $('#jdigiclock-currentDay').html(date);
    },

    refreshTimeWeatherStyles: function() {
        if (this.model.has('timeWheaterConfiguration')) {
            var timeWheaterModel = this.model.get('timeWheaterConfiguration');
            this.applyStyle('timeWheaterConfiguration');
        }
    },

    onRender: function() {

        $('#digiclock', this.$el).jdigiclock({
            proxyUrl: 'api/jdigiclock/proxy',
            dayCallback: $.proxy(this.displayCurrentDate, this),
            loadedCallback: $.proxy(this.refreshTimeWeatherStyles, this)
        });

        this.setScrollbarOverview();
    }
});
   
exports.AddHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#add-home-template",

    events: {
        "click .add": "addClicked",
        "click .cancel": "cancelClicked"
    },

    addClicked: function(e){
        e.preventDefault();
        var name = this.$("#home-name").val();
        this.trigger("save", name);
        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }

});

exports.ViewHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#view-home-template",

    events: {
        "click .cancel": "closeClicked",
        "click .delete": "deleteClicked"
    },

    closeClicked: function(e){
        e.preventDefault();
        this.close();
    },

    deleteClicked: function(e){
        e.preventDefault();
        this.model.destroy();
        this.trigger("home:deleted", this.model);
        this.close();
    }

});

exports.EditStyleHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-home-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile"
    },

    loadFile: function(event){
        var imageFile = event.target.files[0];
        this.previewFile(imageFile);
        
        var that = this;
        var fileName = imageFile.name;

        var reader = new FileReader();
        reader.onload = function (event) {
            that.imageStream = event.target.result;
            that.imageFileName = fileName;
        };

        reader.readAsBinaryString(imageFile);
    },

    previewFile: function(file) {
        
        var previewReader = new FileReader();
        previewReader.onload = function (event) {
            $('#holder').children().remove();
            var image = new Image();
            image.src = event.target.result;
            image.width = 150; // a fake resize
            holder.appendChild(image);
        };

        previewReader.readAsDataURL(file);        
    },

    serializeData: function(){

        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        data.type = 'Home';
        data.bodyFields = this.model.get("bodyFields");
        data.myHomeFields = this.model.get("myHomeFields");
        data.myLibraryFields = this.model.get("myLibraryFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.myHomeFields, this.model.get("myHomeConfiguration"));
        this.addStyleValues(data.myLibraryFields, this.model.get("myLibraryConfiguration"));
        this.addStyleValues(data.timeWheaterFields, this.model.get("timeWheaterConfiguration"));

        return data;
    },

    addStyleValues: function(fields, configuration){
        _.each(fields, function(field) {
            if (configuration != null) {
                field.value = configuration.getStyleAttribute(field.id);
            } else {
                field.value = '';
            }
        });
    },

    extractStyle: function(formData, prefix, selector) {

        var styleKeys = _.keys(formData);
        var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(prefix) == 0;
        }, this);

        var styleData = _.pick(formData, styleNames);
        var newStyleData = {};
        _.each(styleData, function(value, key){
            if (value != null && value != '') {
                newStyleData[key.substr(prefix.length)] = value;    
            }
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    updateStyleConfiguration: function(formData, prefix, selector, attributeName) {

        var configurationAttributes = this.extractStyle(formData, prefix, selector);

        var configuration = this.model.get(attributeName);

        if (configuration == null) {
            configuration = new Configuration();
            this.model.set(attributeName, configuration);
        }

        configuration.resetAttributes();

        configuration.set(configurationAttributes);
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("myLibraryFields"), 'id'), 
                                 _.pluck(this.model.get("myHomeFields"), 'id'), 
                                 _.pluck(this.model.get("bodyFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        if (this.imageStream) {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/api/images",
                data: {
                    fileName: that.imageFileName,
                    fileStream: that.imageStream
                },
                success: function (response) {
                    var imagePath = response.imagePath;
                    data['body-background-image'] = 'url(' + imagePath + ')';
                    that.updateStyleConfiguration(data, that.model.bodyPrefix, that.model.bodySelector, "bodyConfiguration");
                    that.updateStyleConfiguration(data, that.model.myLibraryPrefix, that.model.myLibrarySelector, "myLibraryConfiguration");
                    that.updateStyleConfiguration(data, that.model.myHomePrefix, that.model.myHomeSelector, "myHomeConfiguration");

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {
            this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");
            this.updateStyleConfiguration(data, this.model.myLibraryPrefix, this.model.myLibrarySelector, "myLibraryConfiguration");
            this.updateStyleConfiguration(data, this.model.myHomePrefix, this.model.myHomeSelector, "myHomeConfiguration");
            

            this.result = {
                status: "OK"
            }

            this.close();
        }
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        }

        this.close();
    }
});

// Helper Methods
// --------------

var addNewHome = function(){
    var form = new exports.AddHomeForm();

    form.on("save", function(name){
        var home = new Home({ id: name, name: name });

        homesController.homes.add(home);
        homesController.save(home);
        app.vent.trigger("home:selected", home);
    });

    app.modal.show(form);
};