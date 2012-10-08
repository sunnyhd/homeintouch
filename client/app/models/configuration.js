var BaseModel = require('models/base');

module.exports = BaseModel.extend({

	reservedAttributes: ['id', 'selector', 'prefix'],

	getStyleAttributes: function() {
		var styleKeys = this.getStyleKeys();
		return _.pick(this.attributes, styleKeys);
	},

	getStyleReset: function() {
		var styleKeys = this.getStyleKeys();
		var resetAttributes = {};
		_.each(styleKeys, function(styleKey){
			resetAttributes[styleKey] = '';
		});

		return resetAttributes;
	},

	getStyleKeys: function() {
		return _.difference(_.keys(this.attributes), this.reservedAttributes);
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