var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click button': 'showMoreClicked'
    },

    template: require('templates/music/song_list_pager'),

    showMoreClicked: function(e) {
        this.trigger('show-more');
    }
    
});