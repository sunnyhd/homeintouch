var Albums = require('collections/albums');

module.exports = Backbone.Model.extend({
    
    idAttribute: 'artistid',

    initialize: function() {
        this.albums = new Albums();
        this.albums.url = '/api/artists/' + this.id + '/albums';
    }

});