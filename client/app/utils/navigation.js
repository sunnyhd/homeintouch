var app = require('app');

/**
 * current: { title, action }
 * previous: { title, action }
 */
exports.updateNavbar = function(current, previous) {

    var currentItemType = (previous) ? 'room' : 'floor';
    previous || (previous = { title: 'Home', action: '' });

    // Removes previous link texts
    $('#desktop-breadcrumb-nav').find('li.hit-room span').html(''); 
    $('#desktop-breadcrumb-nav').find('li.hit-inner-room span').html('');

    app.updateDesktopBreadcrumbNav( { 
        itemType: currentItemType,
        name: current.title,
        handler: function(e) {
            app.router.navigate(current.action, {trigger: true});
            return false;
        }
    });

    app.updateTouchNav({
        name: current.title,
        previous: previous.title,
        handler: function(e) {
            app.router.navigate(previous.action, {trigger: true});
            return false;
        }
    });
};

/**
 * Adds the click handler to navigate a specified route
 */
exports.addNavigateHandler = function($el, url) {

    $el.click(function() {
        app.router.navigate('#' + url, {trigger: true});
        return false;
    });
};