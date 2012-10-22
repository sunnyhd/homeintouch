var Device = require('models/device');

module.exports = Backbone.Collection.extend({

    model: Device,

	comparator: function(device) {
  		return device.has('order') ? device.get('order') : 1;
	}
});