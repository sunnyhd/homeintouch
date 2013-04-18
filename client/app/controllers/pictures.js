var app = require('app');
var Files = require('collections/files');
var PictureDetailView = require('views/pictures/picture_detail');
var PictureSlideshowView = require('views/pictures/picture_slideshow');
var PictureContainerView = require('views/pictures/picture_container');

exports.showPicturesCoverView = function(path) {

    updateNavs();

    exports.pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: exports.pictures, mode: 'cover' });
    app.main.show(view);

    var options = {
        success: function() {
            view.refreshFilterPanel();
        }
    };

    exports.pictures.fetch(options);
};

exports.showPicturesListView = function(path) {

	updateNavs();

    exports.pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: exports.pictures, mode: 'list' });
    app.main.show(view);

    exports.pictures.fetch();
};

exports.showPictureDetailsView = function(path, mode) {

    var picture = exports.pictures.where({file: path})[0];

    var view = new PictureDetailView({ model: picture, mode: mode });
    app.main.show(view);
};

exports.showSlideshowView = function(path, mode) {
    
    if (exports.pictures.directory === path) {
        var view = new PictureSlideshowView({collection: exports.pictures, mode: mode});
        app.main.show(view);
    } else {
        exports.pictures = new Files([], { type: 'pictures', directory: path });

        var options = {
            success: function(collection, response, options) {
                var view = new PictureSlideshowView({collection: collection, mode: mode});
                app.main.show(view);
            }
        };

        exports.pictures.fetch(options);
    }
};

var updateNavs = function() {
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); // Removes previous link texts
    app.updateDesktopBreadcrumbNav( { 
        itemType: 'floor',
        name: 'Photos', 
        handler: function(e) {
            app.router.navigate('#pictures', {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: 'Photos', 
        previous: 'Home',
        handler: function(e) {
            app.router.navigate('', {trigger: true});
            return false;
        }
    });
};