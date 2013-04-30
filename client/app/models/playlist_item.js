module.exports = Backbone.Model.extend({
    defaults: {
        active: false
    },

    url: function() {
        if(!this.collection) return null;
        return this.collection.url() + '/' + this.index();
    },

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
        this.playlist().open(this.index());
    },

    removeFromPlaylist: function() {
        return this.collection.destroyAt(this.index());
    }

});