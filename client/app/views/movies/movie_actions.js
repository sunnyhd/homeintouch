var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click a': 'itemClicked'
    },

    template: require('templates/movies/movie_actions'),

    itemClicked: function(e) {
    	var $btn = $(e.currentTarget);
        this.trigger( $btn.data('action') );
    }
    
});
