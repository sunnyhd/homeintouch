var app = require('app');
var MovieItemCoverView = require('views/movies/movie_cover_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/movies/movie_cover_list'),
    
    itemView: MovieItemCoverView,

    events: {
		'click .movies-header-option button': 'listViewClicked'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    },

    matchers: function(movie) {
        return movie.get('label');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});