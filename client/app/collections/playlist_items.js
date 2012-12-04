var PlaylistItem = require('models/playlist_item');

module.exports = Backbone.Collection.extend({

    model: PlaylistItem,

    parse: function(res) {
        return res.items;
    },

    getActiveItem: function() {
        var position = this.playlist.get('position');
        
        if (position >= 0) {
            return this.at();
        } else {
            return null;
        }
    },

    destroyAt: function(index) {
        var item = this.at(index);

        item.url = this.url + '/' + index;
        return item.destroy();
    }

});