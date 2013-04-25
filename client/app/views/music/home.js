var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click .hit-icon': 'listViewClicked'
    },

    template: require('templates/music/home'),

    onRender: function() {
        app.loadSvgImgs(this.el);
        var bodyPatternConfiguration = app.controller('homes').currentHome.getDefaultBackgroundStyle();
        this.applyStyle(bodyPatternConfiguration, true);
    },

    applyStyle: function(styleConfiguration, createStylesheet) {

        if (styleConfiguration) {
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

    select: function(mode) {
    	this.$el.find('.hit-icon[data-mode=' + mode + ']').addClass('active');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});