var dataStore = require('../../lib/dataStore');

exports.update = function(req, res) {
    dataStore.set('homes/' + req.params.home, req.body);
    res.json(req.body);
};

exports.destroy = function(req, res) {
	console.log('Remove Home, key: ' + 'homes/' + req.params.home);
    dataStore.rm('homes/' + req.params.home);
    res.send(204);
};