var nettle = require('nettle');
var settings = require('../config');

module.exports = nettle.store({ url: settings.database.mongodb, prefix: 'images' });