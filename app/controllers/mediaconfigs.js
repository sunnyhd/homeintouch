var MediaConfig = require('../models/mediaconfig');
var fs = require('fs');

exports.list = function(req, res, next) {
    MediaConfig.find(req.query, function(err, config) {
      if (err) return next(err);
      res.json(config);
  });
};

exports.get = function(req, res, next) {
  MediaConfig.findOne( { mediaconfigid: req.params.configid }, function(err, config) {
        if (err) return next(err);
        if (!config) return next(new Error('No such config'));
        res.json(config);
    });
};

exports.create = function(req, res, next) {

  console.log(req.body);
  var config = new MediaConfig(req.body);
  config.save(function(err, config){
    if (err) return next(err);
    res.json(config);
  });

};

exports.save = function(req, res) {
  MediaConfig.update({_id : req.body._id}, {$set: {sort: req.body.sort, movie_style: req.body.movie_style}}, function(err, config) {
        if (err) return next(err);
        res.json(req.body);
    });
};