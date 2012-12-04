var Album = require('models/album');

var Albums = module.exports = Backbone.Collection.extend({

    model: Album,

    url: '/api/albums',

    initialize: function(opts) {
    	opts || (opts = {});
    	if (opts.lastN) {
    		this.url = '/api/albums/last/' + opts.lastN;
    	}
    },

    comparator: function(album) {
        return album.get('label');
    }

});