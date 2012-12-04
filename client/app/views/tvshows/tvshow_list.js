var TVShowItemView = require('views/tvshows/tvshow_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({

    template: require('templates/tvshows/tvshow_list'),
    
    itemView: TVShowItemView,

    appendHtml: function(cv, iv) {
        this.$('.tvshows').append(iv.el);
    },

    matchers: function(movie) {
    	var matchList = [movie.get('label')];
    	if (movie.has('episodes')) {
    		_.each(movie.get('episodes').models, function(episode){
	    		matchList.push(episode.get('label'));
	    	});	
    	}
    	
        return matchList;
    }
});