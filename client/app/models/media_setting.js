module.exports = Backbone.Model.extend({

    url: '/api/media/config',

    idAttribute: "_id",

    defaults: {
    	'sort': {
    		'movies_order' : true,
    		'tvshows_order' : true,
    		'music_order' : true,
    		'pictures_order' : true
    	}
    },

    getSortSettings: function() {
    	var sortSettings = this.get('sort');
    	return sortSettings;
    }
});