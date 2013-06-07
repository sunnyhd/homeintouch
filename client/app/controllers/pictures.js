var app = require('app');
var Files = require('collections/files');
var File = require('models/file');
var PictureDetailView = require('views/pictures/picture_detail');
var PictureSlideshowView = require('views/pictures/picture_slideshow');
var PictureContainerView = require('views/pictures/picture_container');

exports.showPicturesCoverView = function(path) {

    updateNavs();
    buildBreadcrumb(path);

    exports.pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: exports.pictures, mode: 'cover', breadcrumb: exports.breadcrumb });
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
    buildBreadcrumb(path);

    exports.pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: exports.pictures, mode: 'list', breadcrumb: exports.breadcrumb });
    app.main.show(view);

    var options = {
        success: function() {
            view.refreshFilterPanel();
        }
    };

    exports.pictures.fetch(options);
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

exports.getPicture = function(item) {
    return Q.when(new File(item));
};

var buildBreadcrumb = function(path) {

    if (!exports.breadcrumb || !path) {
        exports.breadcrumb = [];
        exports.breadcrumb.push({label: 'Home', path: ''});

    } else {

        var breadcrumbItem = _.find(exports.breadcrumb, function(item) {
            return (item.path === path);
        });

        if (!breadcrumbItem && path) {
            exports.breadcrumb.push({label: buildLabel(path), path: path});
        } else {
            var breadcrumbIndex = exports.breadcrumb.indexOf(breadcrumbItem);
            exports.breadcrumb = exports.breadcrumb.slice(0, breadcrumbIndex + 1);
        }
    }
};

var buildLabel = function(path) {

    var lastCharIndex = path.length - 1;
    var lastChar = path.charAt(lastCharIndex);

    if (lastChar === '/') {
        path = path.slice(0, -1);
    }

    var pathArray = path.split('/');
    return pathArray[pathArray.length - 1];
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