var nettle = require('nettle');
var settings = require('../data/settings');

module.exports = nettle.store({ url: settings.database.mongodb, prefix: 'images' });