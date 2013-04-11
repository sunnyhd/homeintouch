var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click button': 'listViewClicked'
    },

    template: require('templates/pictures/picture_selector_list'),

    select: function(mode) {
    	this.$el.find('.btn[data-mode=' + mode + ']').addClass('active');
    },

    listViewClicked: function(e) {

    	var $btn = $(e.currentTarget);
        var directory = this.collection.directory ? this.collection.directory : '';
    	app.router.navigate($btn.attr('href') + directory, {trigger: true});
        return false;
    }
    
});