var Promise = require('./promise');
var request = require('request');
var settings = require('../config');
var url = require('url');

var CACHE_URL = settings.cache.url;

exports.save = function(imageUrl, width) {
    //Save images in cache server
    var imageId = url.parse(imageUrl).pathname;
    var uploadUrl = CACHE_URL + "/upload?source=" + imageUrl + "&widths=" + width;

    return Promise.asPromise(this, request, uploadUrl)
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Upload of image "' + imageId +'" failed. Returned status code ' + res.statusCode);
            } else {
                console.log('Image "' + imageId + '" uploaded succesfully');
                return imageId;
            }  
        })
        .fail(function(err) {
             console.log('Upload of image "' + imageId + '" failed');
             throw err;
        });
};

exports.loadAndPipe = function(imageId) {
    var imageURL = CACHE_URL + "/static" + imageId;

    console.log('Retrieving from cache image:', imageURL);
    return request.get(imageURL);
};

exports.load = function(imageId) {
    var imageURL = CACHE_URL + "/static/" + imageId;

    console.log('Retrieving from cache image:', imageURL);
    return Promise.asPromise(this, request, imageURL)
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Retrieval of image "' + imageId +'" failed. Returned status code ' + res.statusCode);
            } else {
                return res;
            }  
        });
};