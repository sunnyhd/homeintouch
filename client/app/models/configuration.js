var BaseModel = require('models/base');

module.exports = BaseModel.extend({

	reservedAttributes: ['id', 'selector'],

	getStyleAttributes: function() {

		var styleAttributes = _.difference(_.keys(this.attributes), this.reservedAttributes);
		return _.pick(this.attributes, styleAttributes);
	}
});