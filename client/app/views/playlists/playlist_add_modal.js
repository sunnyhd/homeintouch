module.exports = Backbone.Marionette.ItemView.extend({

    template: require('templates/playlists/playlist_add_modal'),

    events: {
        "click .add": "addClicked",
        "click .cancel": "cancelClicked"
    },

    initialize: function() {
        this.bindTo(this.collection, 'reset', this.render, this);
    },

    serializeData: function() {
        return { playlists: this.collection.toJSON() };
    },

    addClicked: function(e){
        e.preventDefault();
        var playlistid = this.$("#playlist").val();
        this.trigger("save", playlistid);
        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }

});