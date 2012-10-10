var BaseModel = require('models/base');

module.exports = BaseModel.extend({

	reservedAttributes: ['id', 'selector', 'prefix', 'defaultStyle'],

	classPrefix: 'class-',

	colorAttribute: 'color',

	getStyleAttributes: function() {
		var styleKeys = this.getStyleKeys();
		var styleAttributes = _.pick(this.attributes, styleKeys);
		if (this.has('defaultStyle')) {
			_.extend(styleAttributes, this.get('defaultStyle'));
		}

		return styleAttributes;
	},

	getColor: function() {
		return this.get(this.colorAttribute);
	},

	getClassesToApply: function() {

		var classString = '';

		var styleNames = _.filter(_.keys(this.attributes), function(styleName) {
            return styleName.indexOf(this.classPrefix) == 0;
        }, this);

        _.each(styleNames, function(styleName) {
        	classString += this.get(styleName) + ' ';
        }, this);

        return classString;
	},

	resetAttributes: function() {
		var styleKeys = _.difference(_.keys(this.attributes), this.reservedAttributes);

		_.each(styleKeys, function(key){
			this.unset(key, {silent: true});
		}, this);
		
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
		var styleKeys = _.difference(_.keys(this.attributes), this.reservedAttributes);

		var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(this.classPrefix) == -1;
        }, this);

        return styleNames;
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