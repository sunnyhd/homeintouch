var app = require('app');
var Import = require('models/import');
var ImportView = require('views/settings/import');

exports.showImport = function() {
    var i = new Import();

    var view = new ImportView({ model: i });
    app.main.show(view);

    return i;
};