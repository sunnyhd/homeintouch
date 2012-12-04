var MediaSetting = require('models/media_setting');

var MediaSettings = module.exports = Backbone.Collection.extend({

    model: MediaSetting,

    url: '/api/media/config'

});