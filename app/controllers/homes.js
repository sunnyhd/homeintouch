var dataStore = require('../../lib/dataStore');

exports.update = function(req, res) {
    dataStore.set('homes/' + req.params.home, req.body);
    res.json(req.body);
};

exports.destroy = function(req, res) {
    dataStore.rm('homes/' + req.params.home);
    res.send(204);
};