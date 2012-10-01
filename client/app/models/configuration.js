var BaseModel = require('models/base');

module.exports = BaseModel.extend({

	reservedAttributes: ['id', 'selector', 'prefix'],

	getStyleAttributes: function() {

		var styleAttributes = _.difference(_.keys(this.attributes), this.reservedAttributes);
		return _.pick(this.attributes, styleAttributes);
	},

	getFormStyleId: function(styleId) {
		return this.get('prefix') + styleId;
	},

	getStyleAttribute: function(styleId) {
		var prefix = this.get('prefix');
		var styleName = styleId;
		if (styleId.indexOf(prefix) == 0) {
			styleName = styleId.substr(prefix.length)
		}

		if (this.has(styleName)) {
			return this.get(styleName);
		}

		return '';
	}
});