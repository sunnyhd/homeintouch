var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click .hit-icon': 'listViewClicked'
    },

    template: require('templates/media/home'),

    select: function(mode) {
    	this.$el.find('.hit-icon[data-mode=' + mode + ']').addClass('active');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    },

    onRender: function() {
        var bodyPatternConfiguration = app.controller('homes').currentHome.getDefaultBackgroundStyle();
        this.applyStyle(bodyPatternConfiguration, true);
        app.loadSvgImgs(this.el);
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
    }
    
});