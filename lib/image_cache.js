var Promise = require('./promise');
var request = require('request');
var settings = require('../config');
var url = require('url');
var crc = require('./crc');

var CACHE_URL = settings.cache.url;
var XBMC_URL = settings.images.importUrl;
var THUMBNAIL_URL = 'special://profile/Thumbnails/';
var imagePrefix = 'image://';

exports.save = function(imageUrl, width) {
    //Save images in cache server
    var imageId = url.parse(imageUrl).pathname;
    var uploadUrl = CACHE_URL + "/upload?source=" + imageUrl + "&widths=" + width;

    return Promise.asPromise(this, request, uploadUrl)
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Upload of image "' + imageId +'" failed. Returned status code ' + res.statusCode);
            } else {
                //console.log('Image "' + imageId + '" uploaded succesfully');
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

    //console.log('Retrieving from cache image:', imageURL);
    return request.get(imageURL);
};

exports.loadFromXBMCAndPipe = function(imageId) {

    imageId = imageId.substring(1);
    imageId = decodeURIComponent(decodeURIComponent(imageId));
    imageId = imageId.substring(imagePrefix.length);

    var thumb = crc.generate(imageId.toLowerCase()); 
    var imageURL = XBMC_URL + THUMBNAIL_URL + thumb.charAt(0) + '/' + thumb + '.jpg';

    //console.log('Retrieving from cache image:', imageURL);

    return Promise.asPromise(request, request.head, imageURL);
};

exports.load = function(imageId) {
    var imageURL = CACHE_URL + "/static/" + imageId;

    //console.log('Retrieving from cache image:', imageURL);
    return Promise.asPromise(this, request, imageURL)
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Retrieval of image "' + imageId +'" failed. Returned status code ' + res.statusCode);
            } else {
                return res;
            }  
        }
    );
};

exports.remove = function(imageId) {
    var imageURL = CACHE_URL + "/remove/" + imageId;

    //console.log('Removing from cache image:', imageId);
    return Promise.asPromise(this, request, imageURL)
        .then(function(res) {
            if (res.statusCode !== 200){
                throw Error('Remotion of image "' + imageId +'" failed. Returned status code ' + res.statusCode);
            } else {
                return res;
            }  
        }
    );  
};