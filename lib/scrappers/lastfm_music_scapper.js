var Promise = require('../promise');
var request = require('request');
var _ = require('underscore');
var settings = require('../../config');
var BaseScrapper = require('./base_scrapper');

var API_KEY =  settings.scrappers.last_fm.api_key;
var BASE_URL = "http://ws.audioscrobbler.com/2.0/";

var LastFmScrapper = BaseScrapper.extend({
	baseUrl: BASE_URL,

	apiParams: {
		api_key: API_KEY,
		format: 'json'
	},

	getArtistImage: function(artistName) {
		console.info('[LastFM] Retrieving artist %s', artistName);
		var self = this;
		return this.callApi('artist.getinfo', {artist: artistName})
		.then(function(res) {
			return self.parse(res, 'artist');
		});
	},

	getAlbumImage: function(artistName, albumName) {
		console.info('[LastFM] Retrieving album %s from artist %s', albumName, artistName);
		var self = this;
		
		return this.callApi('album.getinfo', {artist: artistName, album: albumName})
		.then(function(res) {
			return self.parse(res, 'album');
		});
	},

	callApi: function(method, params) {
		params.method = method;
		return this.get('', params);
	},

	doParse: function(result, entityName) {
    	if(result.error) {
    		throw 'Service returned error ' + result.error + ': ' + result.message;
    	} else {
        	var images = result[entityName].image;
        	var image = _.find(images, function(image) {
        		return (image.size==='mega');
        	});
            return image['#text'];
    	}
	}
});

module.exports = new LastFmScrapper();