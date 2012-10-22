var DeviceGroup = require('models/device_group');

module.exports = Backbone.Collection.extend({

    model: DeviceGroup,

    comparator: function(deviceGroup) {
		return deviceGroup.get("order");
	}

});