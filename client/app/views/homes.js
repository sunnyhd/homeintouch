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

    className: "room-device-group span12 clearfix",

    events: {
        "click .editWidgetStyle": "editWidgetClicked"
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

    initialize: function() {
        this.loading = new $.Deferred();
        app.showLoading(this.loading.promise());
    },

    displayCurrentDate: function(date) {
        $('#jdigiclock-currentDay').html(date);
    },

    refreshTimeWeatherStyles: function() {
        this.applyStyles();
        this.loading.resolve();
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
        "click .showNewEpisodes": "showEpisodesClicked",
        "click .showNewMovies": "showMoviesClicked",
        "click .showNewMusic": "showMusicClicked"
    }),

    initialize: function() {
        this.firstDisplay = true;
    },

    showLoading: function() {
        this.loading = new $.Deferred();
        if (!this.firstDisplay) {
            app.showLoading(this.loading.promise());
        } else {
            this.firstDisplay = false;
        }
    },

    showEpisodesClicked: function() {
        this.showLoading();
        this.collection = new Episodes( {lastN: 25} );
        this.collection.comparator = null;
        this.collectionTemplate = '#episode-recently-added';
        this.refreshRecentlyAdded();
        return false;
    },

    showMoviesClicked: function() {
        this.showLoading();
        this.collection = new Movies( {lastN: 25} );
        this.collection.comparator = null;
        this.collectionTemplate = '#movie-recently-added';
        this.refreshRecentlyAdded();
        return false;
    },

    showMusicClicked: function() {
        this.showLoading();
        this.collection = new Albums( {lastN: 25} );
        this.collection.comparator = null;
        this.collectionTemplate = '#album-recently-added';
        this.refreshRecentlyAdded();
        return false;
    },

    onRender: function() {
        exports.HouseWidgetView.prototype.onRender.apply(this);
        // this.showMoviesClicked();
        this.showMusicClicked();
    },

    refreshRecentlyAdded: function() {
        $('.loading', this.$el).show();
        $('.hit-icon', this.$el).remove();
        
        var loadingAlbums = this.collection.fetch();
        loadingAlbums.done($.proxy(this.onDataLoaded, this));
        loadingAlbums.fail($.proxy(this.onDataError, this));
    },

    onDataLoaded: function() {
        var $container = $('.hit-icon-container .overview', this.$el);
        var tmp = $(this.collectionTemplate).html();
        _.each(this.collection.models, function(model) {
            $container.append( _.template(tmp, {data: model.attributes, _: _ } ));
        });

        // Adds the click handler on media widgets
        $('.hit-icon-container .overview [data-media-action]', this.$el).click(function() {
            app.router.navigate('#' + $(this).data('media-action'), {trigger: true});
            return false;
        });

        this.onDataFinally();
    },

    onDataError: function() {
        console.error('Error fetching the data from the server');
        this.onDataFinally();
    },

    onDataFinally: function() {
        exports.HouseWidgetView.prototype.onRender.apply(this);
        
        $('.loading', this.$el).hide();
        var $widget = $('#recently-added', this.$el);
        app.vent.trigger("home:dashboard:reset-scrollbars", $widget);

        this.loading.resolve();
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
        "change #body-background-image" : "loadFile",
        "change #pattern-background-image": "processBackgroundPattern",
        "click a#clear-background" : "clearBackgroundClicked"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.type = 'Home';
        data.bodyFields = this.model.get("bodyFields");
        data.bodyPatternFields = this.model.get("bodyPatternFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.bodyPatternFields, this.model.get("bodyPatternConfiguration"));

        return data;
    },

    onRender: function() {
        StyleConfigurationView.prototype.onRender.apply(this);
        this.setFileUploadSettings();
    },

    loadFile: function(event) {
        StyleConfigurationView.prototype.loadFile.apply(this, [event]);
        this.hideBackgroundPatternInput();
    },

    hideBackgroundPatternInput: function() {
        this.$('#pattern-background-image').parents('.control-group').hide();
    },

    showBackgroundPatternInput: function() {
        this.$('#pattern-background-image').parents('.control-group').show();
    },

    clearBackgroundClicked: function() {
        StyleConfigurationView.prototype.clearBackgroundClicked.apply(this);
        this.showBackgroundPatternInput();
    },

    setFileUploadSettings: function() {
        var url = this.$('#pattern-background-image').val();
        if (url === 'none') {
            this.resetPreviewHolder();
            this.showBackgroundFileInput();
            this.previewLoadedImage();
        } else {
            if (!_.isUndefined(url)) {
                this.hideBackgroundFileInput();
                this.previewUrl(url);
            }
        }
    },

    processBackgroundPattern: function (event) {
        this.setFileUploadSettings();
    },

    updateModelData: function(data) {
        this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");
        this.updateStyleConfiguration(data, this.model.bodyPatternPrefix, this.model.bodyPatternSelector, "bodyPatternConfiguration");

        if (this.model.get('bodyPatternConfiguration').hasStyleAttributes()) {
            this.model.get('bodyConfiguration').unsetFileAttribute();
        }
    },

    clearStyleModel: function() {
        StyleConfigurationView.prototype.clearStyleModel.apply(this);
        this.model.get('bodyConfiguration').unsetFileAttribute();
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("bodyFields"), 'id'),
                                 _.pluck(this.model.get("bodyPatternFields"), 'id'));

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
                    that.updateStyleConfiguration(data, that.model.bodyPatternPrefix, that.model.bodyPatternSelector, "bodyPatternConfiguration");

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {

            this.updateModelData(data);

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
                if (ui.item) {
                    $("#locationLabel").val( ui.item.label );
                }
                return false;
            },
            select: function( e, ui ) {
                if (ui.item) {
                    $("#locationLabel").val( ui.item.label );
                    $("#location").val( ui.item.value );
                }
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
        "click a.add-floor": "addFloorHandler",
        "click .main-left-container .tabbable li.disabled": "tabDisabledClicked"
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

    tabDisabledClicked: function(e) {
        e.preventDefault;
        return false;
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
        $container = cv.$('.main-right-container .container-fluid');
        $rowContainer = $('<div class="row-fluid">').appendTo($container);

        // If the row entry is hidden on desktop, add the class to the row container
        if ($('.hit-widget.hidden-desktop', $(iv.el)).length > 0) {
            $rowContainer.addClass('hidden-desktop');
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
        this.applyStyle('bodyPatternConfiguration');

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
            var tsb = $(c).data('tsb');
            if ( $(c).length > 0 && tsb ) {
                $(c).tinyscrollbar_update();
            }
        });
    },

    /**
     * Sets all the scrollbar containers.
     */
    setScrollbarOverview: function() {
        var $scrollableContainers = this.$el.find('.scrollable-x');

        // For each scrollable container, sets the overview width
        _.each($scrollableContainers, function(container) {
            var $widget = $(container);
            this.setWidgetScrollbarOverview($widget);
        }, this);
    },

    /**
     * Sets an specific scrollbar container.
     */
    setWidgetScrollbarOverview: function($widget) {
        var $icons = $('.hit-icon', $widget);
        var width = 102;
        if ($widget.hasClass('large')) { width = 192; }
        else if ($widget.hasClass('medium')) { width = 147; } 
        else if ($widget.hasClass('small')) { width = 122; } 
        $('.overview', $widget).setPixels('width', $icons.length * width);
    },

    onRender: function() {
        this.setScrollbarOverview();

        var timeWheaterWidget = this.collection.where({'type': 'time-wheater'})[0];

        if (timeWheaterWidget.get('visible')) {
            var location = this.model.get('timeWheaterConfiguration').get('location');

            $('#digiclock-desktop', this.$el).jdigiclock({
                proxyUrl: 'api/jdigiclock/proxy',
                dayCallback: $.proxy(this.displayCurrentDate, this),
                loadedCallback: $.proxy(this.refreshTimeWeatherStyles, this),
                weatherLocationCode: location,
                jdigiclockType: 'big'
            });
        } else {
            var timeWheaterhref = '#desktop-time-weather';
            var $tabContent = this.$('.main-left-container .tabbable .tab-content');

            var $timeWheaterNavPill = this.$('a[href="' + timeWheaterhref + '"]').parent();
            $timeWheaterNavPill.addClass('disabled').removeClass('active');
            $(timeWheaterhref, $tabContent).removeClass('active');

            $timeWheaterNavPill.next().addClass('active');
            var secondHref = $($timeWheaterNavPill.next()[0].firstChild).attr('href');
            $(secondHref, $tabContent).addClass('active');
        }
    },

    displayCurrentDate: function(date) {
        // $('.hit-current-day p', this.$el).first().html(date);
    },

    refreshTimeWeatherStyles: function() {
        this.applyStyles();
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
        "click .cancel": "cancelClicked",
        "change #etsFile": "loadFile"
    },

    serializeData: function() {
        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        var startPageList = [];
        var startHome = {id: ('home-' + this.model.id), label: ('Home: ' + this.model.get('name'))};
        var rooms = [];
        startPageList.push(startHome);
        _.each(this.model.floors.models, function(floor) {
            startPageList.push({id: ('floor-' + floor.id), label: ('Floor: ' + floor.get('name'))});
            rooms.push(floor.rooms.models);
        });

        rooms = _.flatten(rooms);

        _.each(rooms, function(room) {
            startPageList.push({id: ('room-' + room.collection.parentFloor.id + '-' + room.id), label: ('Room: ' + room.get('name'))});
        });

        data.startPageList = startPageList;

        data.startPage = app.getLocalItem('startPage');
        data.startPageTimeout = app.getLocalItem('startPageTimeout') / 1000;

        return data;
    },

    loadFile: function(event){
        var etsFile = event.target.files[0];
        
        var that = this;

        var reader = new FileReader();
        reader.onload = function (event) {
            var fileContent = event.target.result;
            var lineArray = fileContent.split('\n');
            var homeEtsArray = [];
            for (var i = 0; i < lineArray.length; i++) {
                var line = lineArray[i];
                var etsDetail = line.split('\.');
                if (etsDetail.length > 2) {
                    var room = etsDetail[0];
                    var widget =  etsDetail[1];
                    var extraDataArray = etsDetail[2].split(/\t/);
                    var address = extraDataArray[0];
                    var extraData = extraDataArray[1];

                    homeEtsArray.push({room: room, widget: widget, address: address, extraData: extraData});
                }
            }
            that.etsData = homeEtsArray;
        };

        reader.readAsText(etsFile);
    },

    saveClicked: function(e) {
        var name = this.$("#name").val();
        this.model.set("name", name);

        var startPage = this.$("#startPage").val();
        this.model.set("startPage", startPage);

        var startPageTimeout = this.$("#startPageTimeout").val();
        // Multiply the timeout by 1000 to save seconds.
        this.model.set("startPageTimeout", startPageTimeout * 1000);

        this.model.set("etsData", this.etsData);

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