var SongItemView = require('views/music/song_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({

    template: require('templates/music/song_list'),
    
    itemView: SongItemView,

    events: {
        'click a[data-action="next-page"]': 'nextPage'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.songs').append(iv.el);
    },

    matchers: function(song) {
        return [
            song.get('label'),
            song.get('album'),
            song.get('artist')
        ];
    },

    nextPage: function() {
        this.collection.nextPage();
        return false;
    }
    
});