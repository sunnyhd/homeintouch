/**
 * Promises helper.
 * Provides useful methods for using promises.
 * It uses the Q library
 */

var Q = require('q');
var _ = require('underscore');

/**
 * Returns any object as a resolved promised
 */
exports.resolve = function(obj) {
	return Q.when(obj);
}

/**
 * Returns an error as a failed promise
 */
exports.fail = function(err) {
	var deferred = Q.defer();
	deferred.reject(err);

	return deferred.promise;
}

/**
 * Returns a new promised that is resolved when ALL the promises in the array are resolved or
 * if any of the promises fail, this promise fails immediately
 */
exports.all = function(promises) {
	return Q.all(promises);
}

/**
 * Returns a new promised that is resolved when ALL the promises in the array are finished (resolved or failed).
 * The result will contain an array of results, one for each promise
 */
exports.allResolved = function(promises) {
	return Q.allResolved(promises);
}

/**
 * Calls a method that accepts a callback and converts it to return a Promise
 */
exports.asPromise = function(context, func) {
	var promise = exports.withCallback();
	var args = _.tail(arguments, 2) || [];
	args.push(promise.cb)

	func.apply(context, args);

	return promise;
};

/**
 * Creates a new promise with a "cb" property that can be used to convert to promise 
 * any method that requires a callback with the format -> function(err, result)
 */
exports.withCallback = function() {
	var deferred = Q.defer();

	var cb = function(err, results) {
		if (err) {
			deferred.reject(err);	
		} else {
			deferred.resolve(results);	
		}
	};

	var promise = deferred.promise;
	promise.cb = cb;

	return promise;
};