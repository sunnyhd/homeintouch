var app = require('app');
var Import = require('models/import');
var ImportView = require('views/settings/import');
var DatabaseSettingsView = require('views/settings/database_settings');

exports.showImport = function() {
    var i = new Import();

    var view = new ImportView({ model: i });
    app.main.show(view);

    return i;
};

exports.showDatabaseSettings = function() {
	var view = new DatabaseSettingsView();
	app.modal.show(view);
};