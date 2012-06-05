var app = require('app');
var mediaViews = require('views/media');

exports.showMediaMenu = function() {
    var view = new mediaViews.MenuView();
    app.navList.show(view);
};