var app = require('app');
var ArtistItemCoverView = require('views/music/artist_cover_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/music/artist_cover_list'),
    
    itemView: ArtistItemCoverView,

    events: {
		'click .artist-header-option button': 'listViewClicked'
    },
    
    appendHtml: function(cv, iv) {
        /*var movieStyleSettings = app.controller('settings').mediaSettings.getMovieStyleSettings();
        if (movieStyleSettings.hide_watched) {
            if (iv.model.get('playcount') === 0) {
                this.$('.movies').append(iv.el);
            }
        } else {
        }*/
            this.$('.artists').append(iv.el);
    },

    matchers: function(movie) {
        return movie.get('label');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});