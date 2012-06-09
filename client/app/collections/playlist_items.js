var PlaylistItem = require('models/playlist_item');

module.exports = Backbone.Collection.extend({

    model: PlaylistItem,

    getActiveItem: function() {
        var position = this.playlist.get('position');
        
        if (position >= 0) {
            return this.at();
        } else {
            return null;
        }
    },

    removeItem: function(item) {
        var index = this.indexOf(item);
        
        item.url = this.url + '/' + index;
        item.destroy();
    }

});