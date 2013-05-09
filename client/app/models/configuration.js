var BaseModel = require('models/base');

module.exports = BaseModel.extend({

	reservedAttributes: ['id', 'selector', 'prefix', 'defaultStyle', 'fixedStyle'],

	classPrefix: 'class-',

	colorAttribute: 'color',

	fileAttributes: ['background-image'],

	hasStyleAttributes: function() {
		var styleAttributes = this.getStyleAttributes();
		if (_.isEmpty(styleAttributes)) {
			return false;
		} else {
			styleAttributes = _.reject(styleAttributes, function(value, key) {
				return (value === 'none');
			});

			return !_.isEmpty(styleAttributes);
		}
	},

	getStyleAttributes: function(defaultStyleConfiguration) {
		var styleKeys = this.getStyleKeys();
		var styleAttributes = _.pick(this.attributes, styleKeys);

		var filteredStyleAttributes = {};

		_.each(styleAttributes, function(value, key) {
			if (value.toLowerCase() !== 'none') {
				filteredStyleAttributes[key] = value;
			}
		});

		styleAttributes = filteredStyleAttributes;

		if (this.has('fixedStyle')) {
			var fixedStyle = this.get('fixedStyle');

			var keyList = _.keys(fixedStyle);

			var stylesToAdd = {};

			_.each(keyList, function(keyStyle) {
				if (_.has(styleAttributes, keyStyle)) {
					_.extend(stylesToAdd, fixedStyle[keyStyle]);
				}
			});	

			_.extend(styleAttributes, stylesToAdd);
		}

		if (this.has('defaultStyle')) {
			_.extend(this.get('defaultStyle'), styleAttributes);
		}

		if (defaultStyleConfiguration) {
			styleAttributes = _.defaults(styleAttributes, defaultStyleConfiguration.getStyleAttributes());
		}

		return styleAttributes;
	},

	getColor: function() {
		return this.get(this.colorAttribute);
	},

	getSelectors: function() {
		var selector = this.get('selector');
		var selectorArray = [];
		if (_.isString(selector)) {
			selectorArray.push(selector);
		} else if (_.isObject(selector)) {
			var context = (selector.context ? (selector.context + ' ') : '');
			var innerSelector = selector.selector;
			if (_.isArray(innerSelector)) {
				_.each(innerSelector, function(innerItem){
					selectorArray.push(context + innerItem);
				});
			} else {
				selectorArray.push(context + innerSelector);
			}
		}

		return selectorArray;
	},

	getSelectorContext: function() {
		var selector = this.get('selector');
		if (_.isString(selector)) {
			return selector;
		} else if (_.isObject(selector)) {
			return selector.context;
		}

		return '';
	},

	getClassesToApply: function() {

		var classString = '';

		var styleNames = _.filter(_.keys(this.attributes), function(styleName) {
            return styleName.indexOf(this.classPrefix) == 0;
        }, this);

        _.each(styleNames, function(styleName) {
        	classString += this.get(styleName) + ' ';
        }, this);

        if (classString === '') {
        	// Apply the default values
			if (this.has('defaultStyle')) {
				var defaultStyles = this.get('defaultStyle');

				var defaultStyleNames = _.filter(_.keys(defaultStyles), function(styleName) {
		            return styleName.indexOf(this.classPrefix) == 0;
		        }, this);

		        defaultStyleNames = _.union(defaultStyleNames, styleNames);
				
				_.each(defaultStyleNames, function(styleName) {
					if (_.has(defaultStyles, styleName)) {
						classString += defaultStyles[styleName] + ' ';
					}
        		}, this);
			}        	
        }

        return classString;
	},

	unsetFileAttribute: function() {
		var styleKeys = this.fileAttributes;

		_.each(styleKeys, function(key){
			this.unset(key, {silent: true});
		}, this);
	},

	resetAttributes: function() {
		var styleKeys = _.difference(_.keys(this.attributes), this.reservedAttributes, this.fileAttributes);

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