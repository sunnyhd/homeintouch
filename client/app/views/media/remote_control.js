var app = require('app');
var RemoteControl = require('models/remote_control')

module.exports = Backbone.Marionette.ItemView.extend({
    
	events: {
		'click [data-action]': 'actionClicked'
    },

    template: require('templates/media/remote_control'),

    actionClicked: function(el) {
        var action = $(el.currentTarget).data('action');
    	console.log('Action [' + action + ']');

    	RemoteControl.execute(action);
    }

});