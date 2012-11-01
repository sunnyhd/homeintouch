var Device = require('models/device');

module.exports = Backbone.Collection.extend({

    model: Device,

	initialize: function() {
    	this.on("add", this.itemAddedHandler, this);
    },

    itemAddedHandler: function(model, collection, options) {
    	if ( _.isUndefined(model.get('order')) ) {
			model.set('order', this.length - 1);
    	}
    },

	comparator: function(device) {
		return device.get('order');
	}
});