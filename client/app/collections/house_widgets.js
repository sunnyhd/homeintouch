var HouseWidget = require('models/house_widget');

module.exports = Backbone.Collection.extend({

    model: HouseWidget,

	initialize: function() {
    	this.on("add", this.itemAddedHandler, this);
    },

    itemAddedHandler: function(model, collection, options) {
    	if ( _.isUndefined(model.get('order')) ) {
			model.set('order', this.length - 1);
    	}
    },

    comparator: function(houseWidget) {
		return houseWidget.get("order");
	}

});