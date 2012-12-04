var fs = require('fs');

var protocol = 'mongodb';
var dbname = 'hit';

exports.get = function(req, res) {
  var settings = require('../../data/settings');

  var urlRegex = new RegExp(protocol + '://' + '(.*)' + '/' + dbname, 'i');
  var urlArray = urlRegex.exec(settings.database.mongodb);
  var ipPort = urlArray[1];

  var ipPortArray = ipPort.split(':');

  var result = {
    'ip' : ipPortArray[0],
    'port' : ipPortArray[1]
  }

  res.json(result);
};

exports.save = function(req, res) {

  var object = req.body;
  var settings = require('../../data/settings');

  settings.database.mongodb = protocol + '://' + object.ip + ':' + object.port + '/' + dbname;

  var settingsString = JSON.stringify(settings, null, 2);

  fs.writeFile('./data/settings.json', settingsString, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.json({success: 'ok'});
    }
  }); 

};