var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click button': 'listViewClicked'
    },

    template: require('templates/movies/movie_selector_list'),

    select: function(mode) {
    	this.$el.find('.btn[data-mode=' + mode + ']').addClass('active');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});