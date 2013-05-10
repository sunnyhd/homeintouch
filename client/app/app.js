var Router = require('router');
var DPT_Transfomer = require('lib/dpt');
var ModalManager = require('lib/modal_manager');
var LoadingView = require('views/loading');

var app = module.exports = new Backbone.Marionette.Application();
var socket;

// EIBD <-> Decimal conversion
app.eibdToDecimal = function (n){return (n - 0x800) / 0x32 };
app.decimalToEibd = function (n){return n * 0x32 + 0x800 };

var Modal = ModalManager.extend({ el: "#modal" });
var Iframe = ModalManager.extend({ el: "#iframe" });
var Loading = ModalManager.extend({ el: "#loading" });

$('.hit-refresh').click(function() {
    window.location.reload();
});

app.addRegions({

    // Desktop regions
    desktopTopConfig: '#desktop-top-config ul.dropdown-menu',
    desktopTopOpts: '#desktop-top-opts ul.dropdown-menu',
    desktopTopSwitch: '#desktop-top-switch',
    desktopNowPlaying: '#desktop-now-playing',

    // Touch device (tablets & phones) regions
    touchBottomContent: '#navbar-bottom-content',
    touchBottomConfig: '#touch-bottom-config ul.dropdown-menu',
    touchTopOpts: '#touch-top-opts ul.dropdown-menu',
    touchTopSwitch: '#touch-top-switch',

    // Main & Modal regions
    subnav: '#subnav', // FIXME delete this
    main: '#main-content',
    modal: Modal,
    loading: Loading,
    iframe: Iframe
});

app.closeRegions = function() {
    app.desktopTopConfig.close();
    app.desktopTopOpts.close();
    app.desktopTopSwitch.close();
    app.desktopNowPlaying.close();

    app.touchBottomContent.close();
    app.touchBottomConfig.close();
    app.touchTopOpts.close();
    app.touchTopSwitch.close();
    app.subnav.close(); // FIXME delete this
    app.main.close();
    app.modal.close();
    app.loading.close();
};

app.setBackgroundImg = function(img) {
    var data = {
        'background-image': 'url(' + img + ')',
        'background-size': 'cover',
        'opacity': '0.75'
    };
    var stylesheet = app.generateStylesheet('body:before', data);
    app.addStyleTag(stylesheet);
},

app.setRepeatBackgroundImg = function(img) {
    var data = {
        'background-image': 'url(' + img + ') !important',
        'background-size': 'cover',
        'background-attachment': 'fixed'
    };
    var stylesheet = app.generateStylesheet('body', data);
    app.addStyleTag(stylesheet);
},

app.removeBackgroundImg = function() {
    $('#body-style').remove();
}

/**
 * Updates the desktop top navigation.
 * opts: {itemType, name, handler}
 * */
app.updateDesktopBreadcrumbNav = function (opts) {

    // Param validations
    (opts) || (opts = {});
    (opts.itemType) || (opts.itemType = 'home');
    (opts.name) || (opts.name = '');
    (opts.handler) || (opts.handler = function(e) {
        e.preventDefault();
    });

    if (opts.itemType === 'home') {
        $('#desktop-top-switch').show();
        $('#touch-top-switch').show();
    } else {
        $('#desktop-top-switch').hide();
        $('#touch-top-switch').hide();
    }

    var $breadcrumb = $('#desktop-breadcrumb-nav'); // Breadcrumb container
    $('li', $breadcrumb).removeClass('active'); // Removes the active element

    var $li = $('li.hit-' + opts.itemType, $breadcrumb).addClass('active'); // Actives the selected button
    $('a span', $li).html('&nbsp;' + opts.name); // Sets the link text
    $('a', $li).off('click').on('click', opts.handler); // Removes previous and sets the new click handler
};

/**
 * Updates the touch devices top navigation.
 * opts: {itemType, name, handler}
 * */
app.updateTouchNav = function (opts) {

    // Param validations
    (opts) || (opts = {});
    (opts.name) || (opts.name = '');
    (opts.previous) || (opts.previous = '');
    (opts.handler) || (opts.handler = function(e) {
        e.preventDefault();
    });

    $('#home-touch-title').html('&nbsp;' + opts.name);
    var $touchNav = $('#touch-top-nav');
    $('a span', $touchNav).html('&nbsp;' + opts.previous);
    $('a', $touchNav).off('click').on('click', opts.handler);
    $touchNav.show();
};

app.hitIcons = function($el) {
    if ($el.length) {
        $('.hit-icon', $el).click(function(e) {
            var $icon = $(e.currentTarget);
            var url = $icon.data('hit-icon-href');
            if (url) {
              window.location.href = url;
            }
        });
    }
};

/**
 * Generates the URL for an image type and color.
 */
app.getImgUrl = function(type, color) {
    var appliedColor = "0xFFFFFF";
    if (color) {
        if (color.indexOf('#') === 0) {
            appliedColor = "0x" + color.substring(1);
        } else {
             appliedColor = color;
        }
    }
    var urlRoot = '/api/svg/';
    return urlRoot + appliedColor + '/' + type.replace(/\./g, '-') + '.svg';
};

app.loadSvgImgs = function(container, color) {
    var $container = $(container);

    $.each ( $('img[data-svg]', $container), function (idx, img) {
        var $img = $(img);
        var url = app.getImgUrl( $img.data('svg'), color );
        $img.attr('src', url);
    });
};

/**
 * Loads the svg icons depending on the data-hit-icon-type value.
 */
app.loadIcons = function(container, color) {
    var $container = $(container);

    $.each($('.hit-icon[data-hit-icon-type]', $container), function (idx, icon) {
        var iconType = $(icon).data('hit-icon-type');
        var url = app.getImgUrl(iconType, color);
        $(icon).css('background-image', "url(\""+url+"\")");
    });
};

app.changeIconState = function($icon, color) {
    if ($icon.length) {
        var iconType = $icon.data('hit-icon-type');
        if (iconType) {
            var url = app.getImgUrl(iconType, color);
            $icon.css('background-image', "url(\""+url+"\")");
        }
    }
};

/** To load only one time the icons */
app.getBackgroundIcon = function(iconType, color) {
    var url = app.getImgUrl(iconType, color);
    return "url(\""+url+"\")";
};


app.applyBackgroundIcon = function($container, iconStr) {
    $container.css('background-image', iconStr);
};

// Start Page functions
app.setStartPageTimeout = function(timeout) {

    app.startPageInterval = timeout;
    if (timeout > 0) {
        app.startPageTimeoutId = setTimeout(function(){
            console.log('Start Page Timeout');
            app.router.navigate('');
            app.vent.trigger('home:showStartPage');
        }, timeout);    
    }
};

app.resetStartPageTimeout = function(timeout) {
    this.clearStartPageTimeout();
    app.startPageInterval = ((timeout !== null) && !_.isUndefined(timeout)) ? timeout : app.startPageInterval;
    app.setStartPageTimeout(app.startPageInterval);
};

app.clearStartPageTimeout = function() {
    if (app.startPageTimeoutId !== null) {
        clearTimeout(app.startPageTimeoutId);    
    }
};

// Loading modal message
app.showLoading = function(promise) {
    var loadingView = new LoadingView({title: 'Loading...'});
    app.loading.show(loadingView);
    promise.done(function() {
        loadingView.close();
    });
};

// Local Storage functions
app.getLocalItem = function(key) {
    return localStorage.getItem(key);
};

app.setLocalItem = function(key, value) {
    localStorage.setItem(key, value);
};

app.vent.on('device:read', function(address){
    socket.emit('eib:get', address);
});

app.vent.on('device:write', function(addressModel, value){
    
    var address;
    var encodedValue = value;
    var dptType = '';
    if (_.isString(addressModel)) {
        address = addressModel
    } else {
        dptType = addressModel.get('dptType');
        if (dptType) {
            encodedValue = '0x' + DPT_Transfomer.getDptEncode(dptType)(value);
        } else {
            encodedValue = '0x' + value.toString(16);
        }
        
        address = addressModel.get("address");    
    }
    console.log('set value', encodedValue);
    socket.emit('eib:set', address, encodedValue, dptType);
});

app.vent.on('device:camera:command', function(address, value){
    socket.emit('eib:command:send', value);
});

app.vent.on('xbmc:command', function(command) {
    socket.emit('xbmc:command:send', command);
});

var controllers = {};
app.controller = function(name) {
    if (!controllers[name]) {
        controllers[name] = require('controllers/' + name);
    }
    return controllers[name];
};

// Initializers
// ---------------

app.addInitializer(function() {
    // Load controllers
    app.controller('device_types');
    app.controller('devices');
    app.controller('floors');
    app.controller('homes');
    app.controller('rooms');
    app.controller('players');
    app.controller('playlists');
    app.controller('movies');
    app.controller('music');
    app.controller('pictures');
    app.controller('settings');
});

app.addInitializer(function() {
    // Load settings
    app.controller('settings').loadMediaSettings();
});

app.addInitializer(function(options) {
    // Load bootstrapped data
    app.controller('device_types').deviceTypes.reset(options.deviceTypes);
    app.controller('homes').homes.reset(options.homes);    

    // URL of XBMC VFS
    app.vfsURL = options.vfsURL;
});

app.addInitializer(function(options) {

    // Initializes the player and playlist modules
    if (options.players) {
        app.controller('players').init(options.players);
        app.controller('playlists').init(options.players);
    }
});

app.addInitializer(function() {
    // Bind socket events
    socket = io.connect();

    socket.on('connect', function() {
        app.vent.trigger('socket:connected');
    });

    socket.on('disconnect', function() {
        app.vent.trigger('socket:disconnected');
    });

    socket.on('error', function(err){
        console.log('socket error:', err);
    });

    socket.on('eib:address', function(id, value) {
        console.log('address: ', id, value);
        app.vent.trigger('address', id, value);
    });

    socket.on('xbmc:notification', function(data) {
        var method = data.method.split('.');
        var e = ['xbmc', method[0].toLowerCase(), method[1].toLowerCase()].join(':');
        app.vent.trigger(e, data.params.data);
    });

    socket.on('media:data-changed', function() {
        console.log('Media data changed on server.');
        app.vent.trigger('media:data-changed');
    });

    socket.on('xbmc:error', function(data) {
        console.log('xbmc:error', data);
    });
});

app.addInitializer(function() {
    $('a').live('click', function(e) {
        if ($(this).attr('href') === '#') {
            e.preventDefault();
        }

        return false;
    });

    $(document).on('click', function(e) {
        app.resetStartPageTimeout();
    });

    // Start router
    app.router = new Router({ app: app });
    Backbone.history.start();
});

// Media data loader/updater
// -------------------------
app.loadMediaData = function () {

    // Movies media data
    var moviesController = app.controller('movies');
    moviesController.loadMovies();

    // TV Shows media data
    var tvShowsController = app.controller('tvshows');
    tvShowsController.loadShows();

    // Music media data
    var musicController = app.controller('music');
    musicController.loadMusic();
}

app.vent.on('media:data-changed', function(address, value) {
    app.loadMediaData();
    console.log('Media data updated on client.');
});

// Handlebars
// ---------------

Handlebars.registerHelper('toFixed', function(value, n) {
    n || (n = 0);
    return value.toFixed(n);
});

Handlebars.registerHelper('image', function(url) {
    return app.vfsURL + url;
});

// Extensions
// ---------------

Backbone.Marionette.View.prototype.getTemplateSelector = function() {
    var template;

    if (this.options && this.options.template){
        template = this.options.template;
    } else {
        template = this.template;
    }

    return template;
};

var origRender = Backbone.Marionette.Renderer.render;
Backbone.Marionette.Renderer.render = function(template, data){
    if (typeof template === 'string') {
        return origRender.apply(Backbone.Marionette.Renderer, arguments);
    } else {
        var render = $.Deferred();
        render.resolve(template(data));
        return render.promise();
    }
};

var viewHelpers = {
    getAddress: function(addressType){
        var address = _.find(this.addresses, function(addr){
            return addr.type == addressType
        });
        return address;
    },

    getAddressValue: function(addressType){
        var address = _.find(this.addresses, function(addr){
            return addr.type == addressType
        });

        if (address) {
            return _.has(address, "address") ? address.address : "";
        } else {
            return "";
        }
    },

    isDefined: function(attribute) {
        return (!_.isUndefined(attribute));
    },

    getValue: function(attribute) {
        return _.has(this, attribute) ? this[attribute] : "";
    },

    isChecked: function(attribute) {
        return ( _.has(this, attribute) && this[attribute] );
    },

    isCheckedFriendly: function(attribute) {
        return ( (_.has(this, attribute) && this[attribute]) ? 'Yes' : 'No' );
    }
};

// apply all view helpers to the base item view's serialize data
var itemViewPrototype = Backbone.Marionette.ItemView.prototype;
itemViewPrototype.serializeData = _.wrap(itemViewPrototype.serializeData, function(original){
    var data = original.apply(this, arguments);

    if (data) {
        _.extend(data, viewHelpers);
    }

    return data;
});

// Jquery helpers
$.fn.getPixels = function(property) {
    return parseInt(this.css(property).slice(0,-2));
};
$.fn.setPixels = function(property, value) {
    return this.css(property, value + 'px');
};

/**
* Injects the given CSS as string to the head of the document.
*
* @method add_style_tag
* @param {String} css The styles to apply.
*/
app.addStyleTag = function(css) {
  var d = document;

  var head = d.getElementsByTagName('head')[0];
  var styleTag;
  var childList = head.children;
  for (var i = 0; i < childList.length; i++) {
    var styleNode = childList[i];
    var styleId = styleNode.getAttribute('id');
    if (styleId) {
        if (styleId === 'body-style') {
            styleTag = styleNode;
        }
    }
  }

  if (!styleTag) {
    styleTag = d.createElement('style');
    head.appendChild(styleTag);
    styleTag.setAttribute('type', 'text/css');
    styleTag.setAttribute('id', 'body-style');  
  }

  if (styleTag.styleSheet) {
    styleTag.styleSheet.cssText = css;
  } else {

    if ( styleTag.hasChildNodes() )
    {
        while ( styleTag.childNodes.length >= 1 )
        {
            styleTag.removeChild( styleTag.firstChild );       
        } 
    }
    styleTag.appendChild(document.createTextNode(css));
  }  
};

app.generateStylesheet = function(selector, stylesheet) {

    var result = '';

    if (_.size(stylesheet) > 0) {

        result = selector;
        result += ' {'
        _.each(stylesheet, function(value, key){
            result += key;
            result += ' : ';
            result += value;
            result += '; '
        });

        result += '}';
    }

    return result;   
}

app.isTouchDevice = function() {  
  try {  
    document.createEvent("TouchEvent");  
    return true;  
  } catch (e) {  
    return false;  
  }  
}

app.loadCss = function(filename) {
  var fileref = document.createElement("link");
  fileref.setAttribute("rel", "stylesheet");
  fileref.setAttribute("type", "text/css");
  fileref.setAttribute("href", filename);
  if (typeof fileref!="undefined")
    document.getElementsByTagName("head")[0].appendChild(fileref);
}

app.newTab = function(url) {
    window.open(url, '_blank');
    window.focus();
}

// Load touch specific styles
if (app.isTouchDevice()) {
    app.loadCss('/css/hit-touch-devices.css');
}

// Widget color classes
app.colorClasses = [{label: "Blue", value: "blue"}, {label: "Dark Blue", value: "dark-blue"}, 
                    {label: "Yellow", value: "yellow"}, {label: "Dark Yellow", value: "dark-yellow"}, 
                    {label: "Violet", value: "violet"}, {label: "Dark Violet", value: "dark-violet"}, 
                    {label: "Green", value: "green"}, {label: "Dark Green", value: "dark-green"},
                    {label: "Gray", value: "gray"}, {label: "Dark Gray", value: "dark-gray"} ];

app.backgroundPatterns = [{label: "None", value: "none"},
                          {label: "AZ Subtle", value: "url(img/bkg-pattern/az_subtle.png)"},
                          {label: "Billie Holiday", value: "url(img/bkg-pattern/billie_holiday.png)"},
                          {label: "Bo Play", value: "url(img/bkg-pattern/bo_play.png)"},
                          {label: "Cream Paper", value: "url(img/bkg-pattern/creampaper.png)"},
                          {label: "Debut Dark", value: "url(img/bkg-pattern/debut_dark.png)"},
                          {label: "Debut Light", value: "url(img/bkg-pattern/debut_light.png)"},
                          {label: "Diagonal Waves", value: "url(img/bkg-pattern/diagonal_waves.png)"},
                          {label: "Nasty Fabric", value: "url(img/bkg-pattern/nasty_fabric.png)"},
                          {label: "Otis Redding", value: "url(img/bkg-pattern/otis_redding.png)"},
                          {label: "Slice Black", value: "url(img/bkg-pattern/slice_black.jpg)"},
                          {label: "Twinkle Twinkle", value: "url(img/bkg-pattern/twinkle_twinkle.png)"},
                          {label: "Wild Oliva", value: "url(img/bkg-pattern/wild_oliva.png)"},                          
                          {label: "Wood Dark", value: "url(img/bkg-pattern/wood_dark.jpg)"}];
