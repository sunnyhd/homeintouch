var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click .hit-icon': 'listViewClicked'
    },

    template: require('templates/media/home'),

    onRender: function() {
        app.loadSvgImgs(this.el);
    },

    select: function(mode) {
    	this.$el.find('.hit-icon[data-mode=' + mode + ']').addClass('active');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});