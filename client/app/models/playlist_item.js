module.exports = Backbone.Model.extend({

    isActive: function() {
        var items = this.collection;
        if (!items) return false;

        var active = items.getActiveItem();
        return active && active.id === this.id;
    },

    removeFromList: function() {
        this.collection.removeItem(this);
    }

});