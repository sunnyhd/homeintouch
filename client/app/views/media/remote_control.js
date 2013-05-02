var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click [data-action]': 'actionClicked'
    },

    template: require('templates/media/remote_control'),

    actionClicked: function(el) {
        var action = $(el.currentTarget).data('action');
    	console.log('Action [' + action + ']');
    }

});