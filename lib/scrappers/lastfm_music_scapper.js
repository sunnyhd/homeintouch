var Class = require('simple-class').Class;
var Promise = require('../promise');
var request = require('request');
var _ = require('underscore');
var settings = require('../../config');

var API_KEY =  settings.scrappers.last_fm.api_key;
var BASE_URL = "http://ws.audioscrobbler.com/2.0/";

var Scrapper = Class.extend({
	get: function(url, qs) {
		console.log('Calling URL:', url);
		return Promise.asPromise(this, request, {
			url: url,
			qs: qs || {}
		})
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Returned error status code:', res.statusCode);
            } 

			return res;            	
        })
        .fail(function(err) {
             throw err;
        });
	},

	callApi: function(method, params) {
		params = params || {};
		params.method = method;
		params.api_key = API_KEY;
		params.format = 'json';

		return this.get(BASE_URL, params);
	},

	parse: function(res, entityName) {
		var result = JSON.parse(res.body);
    	if(result.error) {
    		return Promise.fail('Service returned error ' + result.error + ': ' + result.message);
    	} else {
        	var images = result[entityName].image;
        	var image = _.find(images, function(image) {
        		return (image.size==='mega');
        	});
            return Promise.resolve(image['#text']);
    	}
	},

	getArtistImage: function(artistName) {
		var self = this;
		return this.callApi('artist.getinfo', {artist: artistName})
		.then(function(res) {
			return self.parse(res, 'artist');
		});
	},

	getAlbumImage: function(artistName, albumName) {
		var self = this;
		
		return this.callApi('album.getinfo', {artist: artistName, album: albumName})
		.then(function(res) {
			return self.parse(res, 'album');
		});
	}

});

module.exports = new Scrapper();