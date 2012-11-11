var app = require('app');

var homesController = require('controllers/homes');
var playersController = require('controllers/players');

var Home = require('models/home');
var Configuration = require('models/configuration');

var Movies = require('collections/movies');
var Episodes = require('collections/episodes');
var Albums = require('collections/albums');

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

exports.HouseWidgetView = Backbone.Marionette.ItemView.extend({

    className: "room-device-group span6 clearfix",

    events: {
        "click a#editWidgetStyle": "editWidgetClicked"
    },

    editWidgetClicked: function() {
        app.vent.trigger("home:editWidget", this);
        return false;
    },

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);
        data.floors = this.model.collection.parentHome.floors.toJSON();

        return data;
    },

    onRender: function() {
        this.applyStyles();
    },

    refreshIcon: function() {

        var context = this.model.getViewId();
        var styleConfigurationName = 'bodyConfiguration';

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            app.loadIcons(context, configuration.getColor());    
        } else {
            app.loadIcons(context);
        }
    },

    applyStyle: function(styleConfigurationName, context, applySelector, createStylesheet) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            var that = this;
            _.each(selectorArray, function(selector){
                var fullSelector = selector;
                if (context) {
                    fullSelector = context + ' ' + selector;
                }
                that.$(fullSelector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    var classesToRemove = _.pluck(app.colorClasses, 'value').join(' ');
                    that.$(fullSelector).removeClass(classesToRemove).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(fullSelector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(fullSelector).css(configuration.getStyleAttributes());    
                }
            });            
        }
    },

    applyStyles: function() {

        this.applyStyle('bodyConfiguration', this.model.getViewId(), true);
        this.applyStyle('titleConfiguration', this.model.getViewId(), true);

        this.refreshIcon();
    },

    updateStyles: function() {
        this.applyStyles();
    }
});

exports.TimeWheaterWidgetView = exports.HouseWidgetView.extend({

    displayCurrentDate: function(date) {
        $('#jdigiclock-currentDay').html(date);
    },

    refreshTimeWeatherStyles: function() {
        this.applyStyles();
    },

    onRender: function() {
        
        var location = this.model.collection.parentHome.get('timeWheaterConfiguration').get('location');

        $('#digiclock', this.$el).jdigiclock({
            proxyUrl: 'api/jdigiclock/proxy',
            dayCallback: $.proxy(this.displayCurrentDate, this),
            loadedCallback: $.proxy(this.refreshTimeWeatherStyles, this),
            weatherLocationCode: location
        });

        exports.HouseWidgetView.prototype.onRender.apply(this);
    },

    updateStyles: function() {
        this.render();
    }
});

exports.RecentlyAddedWidgetView = exports.HouseWidgetView.extend({

    events: _.extend({}, exports.HouseWidgetView.prototype.events, {
        "click a#showNewEpisodes": "showEpisodesClicked",
        "click a#showNewMovies": "showMoviesClicked",
        "click a#showNewMusic": "showMusicClicked"
    }),

    showEpisodesClicked: function() {
        return false;
    },

    showMoviesClicked: function() {
        return false;
    },

    showMusicClicked: function() {
        return false;
    },

    onRender: function() {
        exports.HouseWidgetView.prototype.onRender.apply(this);
        this.refreshRecentlyAdded();
    },

    refreshRecentlyAdded: function() {
        var $container = $('.hit-icon-container .overview', this.$el);
        var $loading = $('.loading', this.$el);
        $loading.show();

        var collection = new Albums();
        var loadingAlbums = collection.fetch();
        var prx = this.prx;

        loadingAlbums.done($.proxy(this.onDataLoaded, this));
        loadingAlbums.fail($.proxy(this.onDataError, this));
        loadingAlbums.always($.proxy(this.onDataFinally, this));
    },

    onDataLoaded: function(data) {
        console.log('success: ' + data);
    },

    onDataError: function() {
        console.log('error');  
    },

    onDataFinally: function() {
        var $loading = $('.loading', this.$el);
        $loading.hide();
        exports.HouseWidgetView.prototype.onRender.apply(this);
    }
});

var widgetViews = {
    "my-house": exports.HouseWidgetView,
    "my-library": exports.HouseWidgetView,
    "time-wheater": exports.TimeWheaterWidgetView,
    "recently-added": exports.RecentlyAddedWidgetView
};

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

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));

        return data;
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.pluck(this.model.get("bodyFields"), 'id');

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

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {
            this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");

            this.result = {
                status: "OK"
            }

            this.close();
        }
    }
});

exports.EditStyleWidgetForm = StyleConfigurationView.extend({

    template: "#edit-widget-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.bodyFields = this.model.get("bodyFields");
        data.titleFields = this.model.get("titleFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.titleFields, this.model.get("titleConfiguration"));

        return data;
    },

    getFormFields: function() {
        return _.union(_.pluck(this.model.get("titleFields"), 'id'),
                       _.pluck(this.model.get("bodyFields"), 'id'));
    },

    updateModel: function(data) {
        this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");
        this.updateStyleConfiguration(data, this.model.titlePrefix, this.model.titleSelector, "titleConfiguration");
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = this.getFormFields();

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        this.updateModel(data);

        this.result = {
            status: "OK"
        }

        this.close();
    }
});

exports.EditTimeWeatherForm = exports.EditStyleWidgetForm.extend({

    template: "#edit-time-weather-settings-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    initialize: function() {
        this.homeModel = this.model.collection.parentHome;
    },

    serializeData: function(){
        var data = exports.EditStyleWidgetForm.prototype.serializeData.apply(this);

        data.timeWheaterFields = this.homeModel.get("timeWheaterFields");
        data.timeWheaterConfiguration = this.homeModel.get("timeWheaterConfiguration").toJSON();

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

    getFormFields: function() {
        var formFields = exports.EditStyleWidgetForm.prototype.getFormFields.apply(this);
        formFields = _.union(formFields, _.pluck(this.model.get("timeWheaterFields"), 'id'));
        formFields.push('location');
        formFields.push('locationLabel');

        return formFields;
    },

    updateModel: function(data) {
        exports.EditStyleWidgetForm.prototype.updateModel.apply(this, [data]);

        this.homeModel.get("timeWheaterConfiguration").set('location', data.location);
        this.homeModel.get("timeWheaterConfiguration").set('locationLabel', data.locationLabel);
    }
});

/** 
 * Home dashboard view.
 * */
exports.HomeDashboardView = Backbone.Marionette.CompositeView.extend({
    
    template: "#dashboard-home",

    events: {
        "click .floor-item-list": "floorClicked",
        "click .custom-item-list": "customItemClicked",
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

    customItemClicked: function(e) {
        e.preventDefault();
        var page = ($(e.currentTarget).data('item-id'));
        app.vent.trigger("custom-page:" + page, this.model);
    },

    addFloorHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("floor:add");
    },

        // Build an `itemView` for every model in the collection. 
    buildItemView: function(item, ItemView){
        var widgetItemView = widgetViews[item.get('type')];
        var view = new widgetItemView({
            model: item,
            template: item.get('template')
        });
        return view;
    },

    appendHtml: function(cv, iv){

        if (!iv.model.get('visible')) {
            return;
        }

        var $rowContainer = null;
        var $rows = cv.$(".row-fluid.home-widget-container");
        _.each($rows, function(row) {
            if ($('.hit-widget', row).length < 2) {
                $rowContainer = $(row);
            }
        });

        if (!$rowContainer) {
            $container = $(cv.el);
            $rowContainer = $('<div class="row-fluid home-widget-container">').appendTo($container);
        }

        $rowContainer.append(iv.el);
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

        _.each(_.values(this.children), function(itemView){
            itemView.refreshIcon();
        });
        
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

    onRender: function() {
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

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);
        if (!this.model.has('visibilityConfiguration')) {
            data.visibilityConfiguration = {};
            data.visibilityConfiguration['my-house'] = true;
            data.visibilityConfiguration['my-library'] = true;
            data.visibilityConfiguration['time-wheater'] = true;
        }

        return data;
    },

    saveClicked: function(e) {
        var name = this.$("#name").val();
        this.model.set("name", name);

        var $lis = $('#widget-sortable li', this.$el);
        _.each($lis, function(li, idx) {
            var id = $(li).data('model-id');
            var widget = this.model.widgets.get(id);
            widget.set('order', idx);
        }, this);
        this.model.widgets.sort({silent: true});

        var $inputs = this.$('#widget-visibility input');
        _.each($inputs, function(input, idx) {
            var $input = $(input);
            var id = $input.data('model-id');
            var widget = this.model.widgets.get(id);
            widget.set('visible', $input.is(':checked'));
        }, this);

        this.status = "OK";
        this.close();
        return false;
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    },

    onRender: function() {
        $('#widget-sortable', this.$el).sortable();
        $('#widget-sortable', this.$el).disableSelection();
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