var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click button': 'itemClicked'
    },

    template: require('templates/movies/movie_actions'),

    itemClicked: function(e) {
    	var $btn = $(e.currentTarget);
        $btn.data('action');
    	// app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});