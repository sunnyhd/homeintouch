var DeviceGroup = require('models/device_group');

module.exports = Backbone.Collection.extend({

    model: DeviceGroup,

	initialize: function() {
    	this.on("add", this.itemAddedHandler, this);
    },

    itemAddedHandler: function(model, collection, options) {
    	if ( _.isUndefined(model.get('order')) ) {
			model.set('order', this.length - 1);
    	}
    },

    comparator: function(deviceGroup) {
		return deviceGroup.get("order");
	}

});