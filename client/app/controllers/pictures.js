var app = require('app');
var Files = require('collections/files');
var PictureListView = require('views/pictures/picture_list');

exports.showPictures = function(path) {

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

    var pictures = new Files([], { type: 'pictures', directory: path });

    var view = new PictureListView({ collection: pictures });
    app.main.show(view);

    return pictures;
};