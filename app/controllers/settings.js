var fs = require('fs');
var settings = require('../../config');

var protocol = 'mongodb';
var dbname = 'hit';

exports.get = function(req, res) {

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

  settings.database.mongodb = protocol + '://' + object.ip + ':' + object.port + '/' + dbname;

  var settingsString = JSON.stringify(settings, null, 2);

  fs.writeFile(settings.configFile, settingsString, function(err) {
    if (err) {
      console.log(err);
    } else {
      res.json({success: 'ok'});
    }
  }); 

};