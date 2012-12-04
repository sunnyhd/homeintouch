var Songs = require('collections/songs');

module.exports = Backbone.Model.extend({

    idAttribute: 'albumid',

    urlRoot: '/api/albums',

    initialize: function() {
        this.songs = new Songs();
    },

    parse: function(res) {
        this.songs || (this.songs = new Songs());
        this.songs.reset(res.songs);
        delete res.songs;
        return res;
    }

});