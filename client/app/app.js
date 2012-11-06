var Router = require('router');
var DPT_Transfomer = require('lib/dpt');
var ModalManager = require('lib/modal_manager');

var app = module.exports = new Backbone.Marionette.Application();
var socket;

// EIBD <-> Decimal conversion
app.eibdToDecimal = function (n){return (n - 0x800) / 0x32 };
app.decimalToEibd = function (n){return n * 0x32 + 0x800 };

var Modal = ModalManager.extend({ el: "#modal" });
var Iframe = ModalManager.extend({ el: "#iframe" });

$('.hit-refresh').click(function() {
    window.location.reload();
});

app.addRegions({

    // Desktop regions
    desktopTopConfig: '#desktop-top-config',
    desktopTopOpts: '#desktop-top-opts ul.dropdown-menu',
    desktopTopSwitch: '#desktop-top-switch',

    // Touch device (tablets & phones) regions
    touchBottomConfig: '#touch-bottom-config',
    touchTopOpts: '#touch-top-opts ul.dropdown-menu',
    touchTopSwitch: '#touch-top-switch',

    // Main & Modal regions
    subnav: '#subnav', // FIXME delete this
    main: '#main-content',
    modal: Modal,
    iframe: Iframe
});

app.closeRegions = function() {
    app.desktopTopConfig.close();
    app.desktopTopOpts.close();
    app.desktopTopSwitch.close();
    app.touchBottomConfig.close();
    app.touchTopOpts.close();
    app.touchTopSwitch.close();
    app.subnav.close(); // FIXME delete this
    app.main.close();
    app.modal.close();
};

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
 * Loads the svg icons depending on the data-hit-icon-type value.
 */
app.loadIcons = function(container, color) {
    var $container = $(container);
    var appliedColor = "#FFFFFF";
    if (color) {
        appliedColor = color;
    }

    $.each($('.hit-icon[data-hit-icon-type]', $container), function (idx, icon) {
        var iconType = $(icon).data('hit-icon-type');
        var svgIcon = eval("icons." + iconType).replace(/#000000/g, appliedColor);
        if (svgIcon != '') {
            $(icon).css('background-image', "url(\"data:image/svg+xml;utf8,"+svgIcon+"\")");
        }
    });
};

app.changeIconState = function($icon, color) {

    if ($icon.length) {
        var iconType = $icon.data('hit-icon-type');
        if (iconType) {
            var svgIcon = eval("icons." + iconType).replace(/#000000/g, color);
            if (svgIcon != '') {
                $icon.css('background-image', "url(\"data:image/svg+xml;utf8,"+svgIcon+"\")");
            }
        }
    }
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
});

app.addInitializer(function(options) {
    // Load bootstrapped data
    app.controller('device_types').deviceTypes.reset(options.deviceTypes);
    app.controller('homes').homes.reset(options.homes);
    app.controller('players').ids = options.players;
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
});

app.addInitializer(function() {
    $('a').live('click', function(e) {
        if ($(this).attr('href') === '#') {
            e.preventDefault();
        }
    });

    // Start router
    app.router = new Router({ app: app });
    Backbone.history.start();
});

// Handlebars
// ---------------

Handlebars.registerHelper('toFixed', function(value, n) {
    n || (n = 0);
    return value.toFixed(n);
});

Handlebars.registerHelper('image', function(url) {
    return 'http://localhost:8080/vfs/' + url;
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

    getValue: function(attribute) {
        return _.has(this, attribute) ? this[attribute] : "";
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

// Widget color classes
app.colorClasses = [{label: "Blue", value: "blue"}, {label: "Dark Blue", value: "dark-blue"}, 
                    {label: "Yellow", value: "yellow"}, {label: "Dark Yellow", value: "dark-yellow"}, 
                    {label: "Violet", value: "violet"}, {label: "Dark Violet", value: "dark-violet"}, 
                    {label: "Green", value: "green"}, {label: "Dark Green", value: "dark-green"},
                    {label: "Gray", value: "gray"}, {label: "Dark Gray", value: "dark-gray"} ];
