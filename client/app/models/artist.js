var Albums = require('collections/albums');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'artistid',

    urlRoot: '/api/artists',

    initialize: function() {
        this.albums = new Albums();
    },

    parse: function(res) {
        this.albums || (this.albums = new Albums());
        this.albums.reset(res.albums);
        delete res.albums;
        return res;
    }

});