var PlaylistItem = require('models/playlist_item');

module.exports = Backbone.Collection.extend({

    model: PlaylistItem,
    loaded: false,

    url: function() {
        if(!this.playlist) return null;

        return '/api/playlists/' + this.playlist.id + '/items';
    },

    fetch: function() {
        this.loaded = true;
        return Backbone.Collection.prototype.fetch.call(this, arguments);
    },

    parse: function(res) {
        return res.items;
    },

    setActive: function(pos) {
        if(pos < -1 || pos >= this.length) return; 

        this.forEach(function(item) {
            item.set('active', false);
        });

        if(pos >= 0) {
            this.at(pos).set('active', true);    
        }

        return pos;
    },

    getActiveItem: function() {
        var position = this.playlist.get('position');
        
        if (position >= 0) {
            return this.at(position);
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