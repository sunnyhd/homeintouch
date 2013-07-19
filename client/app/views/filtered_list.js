module.exports = Backbone.Marionette.CompositeView.extend({

    events: {
        // 'change input[name=search]': 'search',
        // 'click .search': 'search',
        // 'click .clear': 'clear',
        'click .dropdown-menu a': 'filterChanged'
    },

    initialize: function() {
        this.model = new Backbone.Model();
        this.bindTo(this.model, 'change', this.render, this);
    },

    addItemView: function(item, ItemView) {
        // if (this.filter(item)) {
            return Backbone.Marionette.CompositeView.prototype.addItemView.apply(this, arguments);
        // }
    },

    onRender: function() {
        var app = require('app');
        var homesController = app.controller('homes');
        var home;
        if (!homesController.currentHome) {
            home = homesController.homes.defaultHome();
        } else {
            home = homesController.currentHome;            
        }

        var bodyPatternConfiguration = home.getDefaultBackgroundStyle();
        this.applyStyle(bodyPatternConfiguration, true);
    },

    applyStyle: function(styleConfiguration, createStylesheet) {

        if (styleConfiguration) {
            var app = require('app');
            var selectorArray = styleConfiguration.getSelectors();
            _.each(selectorArray, function(selector){
                $(selector).removeAttr('style');
                var className = styleConfiguration.getClassesToApply();
                if (className !== '') {
                    $(selector).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(selector, styleConfiguration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(styleConfiguration.getStyleAttributes());
                }
                
            });
        }
    },

    // filter: function(item) {
    //     var strip = function(str) {
    //         return str.replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' ');
    //     };

    //     var term = this.model.get('term');
    //     var matchers = this.matchers(item);

    //     if (!_.isArray(matchers)) {
    //         matchers = [matchers];
    //     }

    //     if (term) {
    //         var regex = new RegExp(strip(term).toLowerCase());

    //         return _.any(matchers, function(matcher) {
    //             if (matcher) return strip(matcher).toLowerCase().match(regex);
    //         });
    //     }

    //     return true;
    // },

    filterChanged: function(e) {
        var $filter = $('#current-filter');
        var $newFilter = $(e.currentTarget);
        $filter.find('#filter-name').html($newFilter.html());
        $filter.data('filter', $newFilter.data('filter'));
    }//,

    // matchers: function(model) {
    //     return '';
    // },

    // Event Handlers

    // search: function() {
    //     var term = this.$('input[name=search]').val();
    //     this.model.set('term', term);
    // },

    // clear: function() {
    //     this.model.unset('term');
    // }
    
});