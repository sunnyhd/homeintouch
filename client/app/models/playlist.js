var PlaylistItems = require('collections/playlist_items');
var Command = require('models/player_command');

module.exports = Backbone.Model.extend({

    idAttribute: 'playlistid',

    defaults: {
        position: -1
    },

    initialize: function() {
        this.items = new PlaylistItems();
        this.items.playlist = this;
    },

    setCurrent: function(pos) {
        if(pos < -1 || pos >= this.items.length) return; 
        var old = this.get('position');
        if(old === pos) return;

        this.set('position', pos);

        this.items.setActive(pos);
    },

    loadItems: function() {
        if(this.items.loaded) {
            return Q.when(this.items);
        } else {
            var self = this;
            return Q.when(this.items.fetch()).then(function(items) {
                self.items.setActive(self.get('position'));
            });
        }
    },

    open: function(position) {
        if(this.get('type').toLowerCase() === 'picture') {
            var item = this.items.at(position);
            if(item) Command.openFile(item.get('file'));
        } else {
            Command.openAt(this, position);
        }
        
    },

    clear: function() {
        this.set('position', -1);
        this.items.reset();
    },

    add: function(pos, item) {
        var self = this;
        this.loadItems().then(function() {
            self.items.add(item, {at: pos});
        });
    },

    remove: function(item) {
        var self = this;
        this.loadItems().then(function() {
            self.items.remove(item.id);
        });
    },

    removeAt: function(pos) {
        var self = this;
        this.loadItems().then(function() {
            var item = self.items.at(pos);
            if(item) self.items.remove(item.id);
        });
    },

    title: function() {
        var type = this.get('type');
        return type.charAt(0).toUpperCase() + type.slice(1);
    },

    toJSON: function() {
        var data = Backbone.Model.prototype.toJSON.apply(this, arguments);
        data.title = this.title();
        return data;
    }

});