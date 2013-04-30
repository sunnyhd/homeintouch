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
        if(this.at(index)) {
            // We need to call DELETE on the server 
            // without updating the collection yet (we do it on the 'onRemove' notification)
            // So we create a new item set an "made up" id (to make backbone call the server) and set the correct URL
            var item = new PlaylistItem();
            item.id = this.playlist.id + '.' + index;  
            item.url = this.url() + '/' + index;  
            return item.destroy();
        }
        return Q.when(false);
    }

});