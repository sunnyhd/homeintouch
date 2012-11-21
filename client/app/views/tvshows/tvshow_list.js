var TVShowItemView = require('views/tvshows/tvshow_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({

    template: require('templates/tvshows/tvshow_list'),
    
    itemView: TVShowItemView,

    appendHtml: function(cv, iv) {
        this.$('.tvshows').append(iv.el);
    },

    matchers: function(movie) {
        return movie.get('label');
    }
});