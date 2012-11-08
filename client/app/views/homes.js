var app = require('app');
var homesController = require('controllers/homes');
var Home = require('models/home');
var Configuration = require('models/configuration');
var StyleConfigurationView = require('views/settings/style_settings');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-home-opts",

    events: {
        'click a.add-floor': 'addFloorHandler',
        'click a#home-settings' : 'editHomeHandler',
        'click a#editStyle': 'editStyle'
    },

    addFloorHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

    editHomeHandler: function(e) {
        app.vent.trigger("home:edit", homesController.currentHome);
        return false;
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
        "click .custom-item-list": "customItemClicked",
        "click a.add-floor": "addFloorHandler",
        "click #editTimeWeatherSettings": "timeWeatherSettingsHandler"
    },

    initialize: function() {
        this.resizeHandler = $.proxy(this.updateScrollBar, this);
        $(window).on("resize", this.resizeHandler);
    },

    close: function() {
        $(window).off("resize", this.resizeHandler);  
    },

    timeWeatherSettingsHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("home:editTimeWeather", this.model );
        return false;
    },

    floorClicked: function(e){
        e.preventDefault();
        var floorId = ($(e.currentTarget).data('item-id'));
        app.vent.trigger("floor:selected", this.model.getFloorById(floorId));
    },

    customItemClicked: function(e) {
        e.preventDefault();
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

    // TIME & WEATHER METHODS
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

        var location = this.model.get('timeWheaterConfiguration').get('location');

        $('#digiclock', this.$el).jdigiclock({
            proxyUrl: 'api/jdigiclock/proxy',
            dayCallback: $.proxy(this.displayCurrentDate, this),
            loadedCallback: $.proxy(this.refreshTimeWeatherStyles, this),
            weatherLocationCode: location
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

exports.EditHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-home-template",

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    saveClicked: function(e) {
        var name = this.$("#name").val();
        this.model.set("name", name);
        this.status = "OK";
        this.close();
        return false;
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

exports.EditStyleHomeForm = StyleConfigurationView.extend({

    template: "#edit-home-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.type = 'Home';
        data.bodyFields = this.model.get("bodyFields");
        data.myHomeFields = this.model.get("myHomeFields");
        data.myLibraryFields = this.model.get("myLibraryFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.myHomeFields, this.model.get("myHomeConfiguration"));
        this.addStyleValues(data.myLibraryFields, this.model.get("myLibraryConfiguration"));

        return data;
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
    }
});

exports.EditTimeWeatherForm = StyleConfigurationView.extend({

    template: "#edit-time-weather-settings-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    serializeData: function(){
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);
        data.type = 'Home';
        data.timeWheaterFields = this.model.get("timeWheaterFields");

        this.addStyleValues(data.timeWheaterFields, this.model.get("timeWheaterConfiguration"));

        return data;
    },

    onRender: function() {
        var $autocompleteEl = $('#locationLabel', this.$el);
        $autocompleteEl.autocomplete({
            minLength: 2,
            source: cities,
            focus: function( e, ui ) {
                $("#locationLabel").val( ui.item.label );
                return false;
            },
            select: function( e, ui ) {
                $("#locationLabel").val( ui.item.label );
                $("#location").val( ui.item.value );
                return false;
            }
        });

        $autocompleteEl.data("autocomplete")._renderItem = function(ul, item) {
            return $( "<li>" )
                .data( "item.autocomplete", item )
                .append( "<a>" + item.label + "</a>" )
                .appendTo( ul );
        };

        $autocompleteEl.data("autocomplete")._renderMenu = function(ul, items) {
            var self = this;
            var subItems = _.first(items, 15);
            $.each(subItems, function(index, item) {
                self._renderItem(ul, item);
            });
            
            $("<li class='ui-menu-item'></li>")
            .append("<span class='ui-autocomplete-result-item'>Showing <b>" + subItems.length + "</b> of <b>" + items.length + "</b> results</span>")
            .appendTo(ul);
        };
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("timeWheaterFields"), 'id'));
        formFields.push('location');
        formFields.push('locationLabel');

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        this.updateStyleConfiguration(data, this.model.timeWheaterPrefix, this.model.timeWheaterSelector, "timeWheaterConfiguration");

        this.model.get("timeWheaterConfiguration").set('location', data.location);
        this.model.get("timeWheaterConfiguration").set('locationLabel', data.locationLabel);

        this.result = {
            status: "OK"
        };
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