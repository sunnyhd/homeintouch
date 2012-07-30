var app = require('app');
var Files = require('collections/files');
var PictureListView = require('views/pictures/picture_list');

exports.showPictures = function(path) {
    var pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureListView({ collection: pictures });
    app.main.show(view);

    return pictures;
};