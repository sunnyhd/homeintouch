var Song = require('models/song');

var Songs = module.exports = Backbone.Paginator.requestPager.extend({

	model: Song,

	paginator_core: {
		dataType: 'json',
    	url: '/api/songpages'
	},

	paginator_ui: {
		firstPage: 0,
		currentPage: 0,
		perPage: 10,
		totalPages: 10
	},

	server_api: {
		'per_page': function() { return this.perPage },
		'page': function() { return this.currentPage },
		'sort': 'title'
	},

	parse: function (response) {
		this.totalRecords = this.totalPages * this.perPage;
		return response.data;
	},

	nextPage: function() {
		var originalModels = this.models;
		var self = this;
		var options = {success: function(collection, response) {
			var newModels = collection.models;
			self.reset(originalModels);
			self.add(newModels);
		}};

		this.requestNextPage(options);
	},

	filter: function(opts) {
		this.server_api.filter = JSON.stringify(opts);
		this.fetch();
	}

});