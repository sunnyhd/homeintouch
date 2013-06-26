var Class = require('simple-class').Class;
var Promise = require('../promise');
var request = require('request');
var _ = require('underscore');

var BaseScrapper = Class.extend({
	baseUrl: '',
	apiParams: {},

	get: function(relativeUrl, params) {
		var url = this.baseUrl + relativeUrl;
		
		_.extend(params, this.apiParams);

		return Promise.asPromise(this, request, {
			url: url,
			qs: params || {}
		})
        .then(function(res) {
            if (res.statusCode >= 400){
                throw Error('Returned error status code: ' + res.statusCode);
            } 

			return res;            	
        });
	},

	parse: function(res) {
		try {
			var args = [this.getResult(res)].concat(_.tail(arguments, 1) || []);
			return Promise.resolve(this.doParse.apply(this, args))
		} catch(err) {
			return Promise.fail(err);
		}
	},

	getResult: function(res) {
		return JSON.parse(res.body);
	}
});


module.exports = BaseScrapper;