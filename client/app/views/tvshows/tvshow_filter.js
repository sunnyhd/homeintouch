module.exports = Backbone.Marionette.ItemView.extend({

	events: {
		'click [data-filter="unwatched"]' : 'filterUnwatched',
		'click [data-filter="all"]' : 'listAll',
		'click #tvshow-genre-list li a' : 'filterByGenre'
	},

    template: require('templates/tvshows/tvshow_filter'),
    
    AllGenres: 'All',

    filter: {},

    filterFields: ['playcount'],

    // Avoid rendering when the series collection is reseted.
    initialEvents: function() {},

    onRender: function() {
    	var that = this;
    	$.get('/api/genres/tvshows')
    	.done(function(data) {
    		that.loadGenres(data);
    	});
    },

    loadGenres: function(genreList) {

    	var allListItem = $('<li><a href="#" data-genre="' + this.AllGenres + '">' + this.AllGenres + '</a></li>');
    	this.$('.dropdown-menu').append(allListItem);

    	for (var i = 0; i < genreList.length; i++) {
    		var genre = genreList[i];
    		var listItem = $('<li><a href="#" data-genre="' + genre + '">' + genre + '</a></li>');
    		this.$('.dropdown-menu').append(listItem);
    	};
    },

    filterByGenre: function(event) {
    	var $element = $(event.currentTarget);
    	var genre = $element.data('genre');
    	if (genre === this.AllGenres) {
    		delete this.filter.genre;
    	} else {
    		this.filter['genre'] = genre;
    	}

        this.$('[data-filter="genre"]').html('Genre: ' + genre);

    	this.listTvShows();
    },

    listAll: function() {

    	for (var i = 0; i < this.filterFields.length; i++) {
    		delete this.filter[this.filterFields[i]];
    	}

    	this.$('div.btn-group a[data-filter]').removeClass('active');
    	this.$('.all').addClass('active');
    	this.listTvShows();
    },

    filterUnwatched: function() {
    	this.filter['playcount'] = 0;
    	this.$('div.btn-group a[data-filter]').removeClass('active');
    	this.$('.unwatched').addClass('active');
    	this.listTvShows();
    },

    listTvShows: function() {
    	this.collection.fetch({data: this.filter});
    }
    
});