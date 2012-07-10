var Album = require('models/album');

var Albums = module.exports = Backbone.Collection.extend({

    model: Album,

    url: '/api/albums',

    comparator: function(album) {
        return album.get('label');
    }

});