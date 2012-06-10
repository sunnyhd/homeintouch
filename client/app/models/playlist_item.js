var Playable = require('models/playable');

module.exports = Backbone.Model.extend({

    playlist: function() {
        return this.collection.playlist;
    },

    index: function() {
        return this.collection.indexOf(this);
    },

    isActive: function() {
        var items = this.collection;
        if (!items) return false;

        var active = items.getActiveItem();
        return active && active.id === this.id;
    },

    play: function() {
        var item = { playlistid: this.playlist().id, position: this.index() };
        var playable = new Playable({ item: item });

        return playable.save();
    },

    removeFromPlaylist: function() {
        return this.collection.destroyAt(this.index());
    }

});