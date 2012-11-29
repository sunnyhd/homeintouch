module.exports = Backbone.Model.extend({

    url: '/api/media/config',

    idAttribute: "_id",

    getSortSettings: function() {
    	var sortSettings = this.get('sort');
    	return JSON.parse(sortSettings);
    }
});