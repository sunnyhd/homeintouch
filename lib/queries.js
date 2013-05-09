var _ = require('underscore');

exports.lastN = function(clazz, n, properties, callback) {
	if (_.isUndefined(callback) && _.isFunction(properties)) {
    	clazz.find().sort('_id', -1).limit(n).exec(properties);
	} else {
		clazz.find({}, properties).sort('_id', -1).limit(n).exec(callback);
	}
	
};