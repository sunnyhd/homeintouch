var app = require('app');
var Files = require('collections/files');
var PictureContainerView = require('views/pictures/picture_container');

exports.showPicturesCoverView = function(path) {

    updateNavs();

    var pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: pictures, mode: 'cover' });
    app.main.show(view);

    return pictures;
};

exports.showPicturesListView = function(path) {

	updateNavs();

    var pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureContainerView({ collection: pictures, mode: 'list' });
    app.main.show(view);

    return pictures;
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