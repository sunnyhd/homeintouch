var app = require('app');
var Import = require('models/import');
var MediaSettings = require('collections/media_settings');
var MediaSetting = require('models/media_setting');
var ImportView = require('views/settings/import');
var DatabaseSettingsView = require('views/settings/database_settings');
var SortSettingsView = require('views/settings/sort_settings');

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

exports.showSortSettings = function() {
	var collection = new MediaSettings();
	collection.fetch({success: function(resultCollection) {

		var model = (resultCollection.length > 0) ? resultCollection.at(0) : new MediaSetting();
		var view = new SortSettingsView({model: resultCollection.at(0)});
		app.modal.show(view);
	}});
};
