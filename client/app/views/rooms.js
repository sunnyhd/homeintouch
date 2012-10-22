var app = require('app');
var roomsController = require('controllers/rooms');
var homesController = require('controllers/homes');
var Room = require('models/room');
var Configuration = require('models/configuration');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-room-opts",

    events: {
        'click a.add-device': 'addDeviceTypeHandler',
        'click a#room-settings': 'editRoomHandler',
        'click a#editStyle': 'editStyle'
    },

    addDeviceTypeHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", this.model);
    },

    editRoomHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:edit", roomsController.currentRoom);
    },

    editStyle: function() {
        app.vent.trigger("room:editStyle", this);
        return false;
    }
});

exports.RoomMoreOptionsView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    id: "room-more-opts",
    className: "hit-nav dropdown pull-right",
    template: "#room-more-options-template",

    events: {
        "click a.add-device-group": "addDeviceTypeClicked"
    },

    addDeviceTypeClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", this.model);
    }
});

exports.NoRoomsView = Backbone.Marionette.ItemView.extend({
    template: "#no-rooms-template"
});

exports.NoDeviceGroupView = Backbone.Marionette.ItemView.extend({
    template: "#no-device-group-template",
});

// Base view for device items in the list
exports.DeviceView = Backbone.Marionette.ItemView.extend({

    events: function(){
        var events = {
            "click .device-name a": "deviceClicked"
        };
        return _.extend(events, this.formEvents);
    },

    constructor: function(){
        Backbone.Marionette.ItemView.prototype.constructor.apply(this, arguments);
        this.model.addresses.each(function(address){
            var type = address.get("type");
            var address = address.get("address");
            if (/read.*/.test(type)){
                app.vent.trigger("device:read", address);
            }
        });
    },

    deviceClicked: function(e){
        e.preventDefault();
        app.vent.trigger("device:selected", this.model);
    },

    refreshIcon: function() {
    }
});

exports.SwitchDeviceView = exports.DeviceView.extend({

    template: "#device-list-switch-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "switchClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_switch");
        this.writeAddress = this.model.getAddressByType("write_switch");
    },

    switchClicked: function (e) {
        e.preventDefault();
        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateSwitch(on);
    },

    flipSwitch: function(on){
        //var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", this.writeAddress, (on ? 1 : 0));
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('selected');
        if (on) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(value == 1);
    },

    onRender: function(){
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
    }

});

exports.DimmerDeviceView = exports.DeviceView.extend({

    template: "#device-list-dimmer-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "switchClicked",
        "change .dimmer": "dimmerChanged"
    },

    initialize: function(){
        this.readSwitch = this.model.getAddressByType("read_switch");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.readDimmer = this.model.getAddressByType("read_dimmer");
        this.writeDimmer = this.model.getAddressByType("write_dimmer");

        this.bindTo(this.readDimmer, "change:value", this.selectDimmer, this);
        this.bindTo(this.readSwitch, "change:value", this.updateSwitch, this);
    },

    switchClicked: function (e) {
        e.preventDefault();

        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateDimmerDetail((on) ? 100 : 0);
    },

    dimmerChanged: function(e){
        var $dimmer = $(e.currentTarget);
        var value = parseInt($dimmer.val());
        var address = this.writeDimmer.get("address");

        this.updateDimmerDetail(value);
        this.selectSwitch((value !== 0));
        app.vent.trigger("device:write", this.writeDimmer, value);

        /*var self = this;
        if (this.dimmerTimeout) {
            clearTimeout(this.dimmerTimeout);
        }
        this.dimmerTimeout = setTimeout(function() {
            self.dimmerTimeout = null;
        }, 500);*/
    },

    flipSwitch: function(on){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", this.writeSwitch, (on ? 1 : 0));
    },

    updateDimmerSlider: function(value) {
        $('.dimmer', this.$el).val(value);
    },

    updateDimmerDetail: function(value) {
        $('.dimmer-detail', this.$el).html((value|0) + '%');
    },

    selectSwitch: function(value){
        $('a', this.$el).removeClass('selected');
        if (value) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(value);
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    updateSwitch: function(address, value){
        this.selectSwitch(value == 1);
    },

    selectDimmer: function(address, value){
        if (this.dimmerTimeout) return;

        this.updateDimmerSlider(value);
        this.updateDimmerDetail(value);
    },

    onRender: function(){
        var value = this.readSwitch.get("value");
        this.updateSwitch(null, value);

        value = this.readDimmer.get("value");
        this.updateDimmerSlider(value);
        this.updateDimmerDetail(value);
    }
});

exports.ShutterDeviceView = exports.DeviceView.extend({

    template: "#device-list-shutter-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click a[data-value='up']": "upClicked",
        "click a[data-value='down']": "downClicked",
        "click a[data-value='stop']": "stopClicked",
        "change .dimmer": "positionChanged"
    },

    initialize: function(){
        this.readPosition = this.model.getAddressByType("read_position");
        this.writePosition = this.model.getAddressByType("write_position");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.writeStop = this.model.getAddressByType("write_stop");

        this.positionChanged = _.debounce(this.positionChanged, 500);

        this.bindTo(this.readPosition, "change:value", this.showPosition, this);
    },

    upClicked: function(e){
        e.preventDefault();
        this.switchUpDown(true);
    },

    downClicked: function(e){
        e.preventDefault();
        this.switchUpDown(false);
    },

    stopClicked: function(e){
        e.preventDefault();
        var address = this.writeStop.get("address");
        app.vent.trigger("device:write", this.writeStop, 1);
    },

    positionChanged: function(e){
        var $position = $(e.currentTarget);
        var value = parseInt($position.val());
        var address = this.writePosition.get("address");
        app.vent.trigger("device:write", this.writePosition, value);
        this.updateShutterDetails(value);
    },

    switchUpDown: function(up){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", this.writeSwitch, (up ? 1 : 0));
    },

    showPosition: function(address, value){
        this.$("input.dimmer").val(value);
        this.updateShutterDetails(value);
    },

    updateShutterDetails: function(shutterValue) {
        this.$('.shutter-detail').html((shutterValue | 0) + '%');
    },

    refreshIcon: function() {
        var $widget = $('.hit-icon', this.$el);
        app.changeIconState($widget, '#FFFFFF');
    },

    onRender: function(){
        var position = this.readPosition.get("value");
        this.showPosition(null, position);
    }

});

exports.ThermostatDeviceView = exports.DeviceView.extend({

    template: "#device-list-thermostat-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click a[data-mode]": "modeClicked",
        "click .thermostat-control a": "setpointChanged"
    },

    modes: {
        1: "comfort",
        2: "standby",
        3: "night",
        4: "frost"
    },

    initialize: function(){
        this.writeMode = this.model.getAddressByType("write_mode");
        this.writeSetPoint = this.model.getAddressByType("write_temperature_set");

        this.readMode = this.model.getAddressByType("read_mode");
        this.readSetPoint = this.model.getAddressByType("read_temperature_set");
        this.readTemperature = this.model.getAddressByType("read_temperature_actual");

        this.bindTo(this.readMode, "change:value", this.showMode, this);
        this.bindTo(this.readSetPoint, "change:value", this.showSetPoint, this);
        this.bindTo(this.readTemperature, "change:value", this.showTemperature, this);
    },

    modeClicked: function(e){
        e.preventDefault();
        var mode = $(e.currentTarget).data("mode");
        var address = this.writeMode.get("address");
        app.vent.trigger("device:write", this.writeMode, mode);

        this.updateModeButton(mode);
    },

    updateModeButton: function(mode) {
        this.$('a[data-mode]').removeClass('selected');
        this.$('a[data-mode="' + mode + '"]').addClass('selected');
    },

    setpointChanged: function(e){
        e.preventDefault();
        var $control = $(e.currentTarget);

        var address = this.writeSetPoint.get("address");

        var changeTemp = ($control.data('value') === 'minus') ? parseFloat("-0.5") : parseFloat("0.5");

        var currentPoint = this.readSetPoint.get("value");
        var setpoint = currentPoint + changeTemp;

        app.vent.trigger("device:write", this.writeSetPoint, setpoint);
    },

    showMode: function(address, mode){
        this.updateModeButton(mode);
    },

    showSetPoint: function(address, setPoint){
        var decimal = setPoint;

        console.log("setpoint eibd value: ", setPoint);
        console.log("setpoint decimal value: ", decimal);

        this.$(".setpoint").html(decimal.toFixed(2) + "&nbsp;");
    },

    showTemperature: function(address, temperature){
        var decimal = temperature;

        console.log("temperature eibd value: ", temperature);
        console.log("temperature decimal value: ", decimal);

        this.$(".temperature").html(decimal.toFixed(2) + "&nbsp;");
    },

    updateIconColor: function(value) {
        var $widget = $('.hit-icon', this.$el);
        app.changeIconState($widget, '#FFFFFF');
    },

    refreshIcon: function() {
        this.updateIconColor();
    },

    onRender: function(){
        var mode = this.readMode.get("value");
        this.showMode(null, mode);

        var setPoint = this.readSetPoint.get("value");
        this.showSetPoint(null, setPoint);

        var temperature = this.readTemperature.get("value");
        this.showTemperature(null, temperature);

        this.updateIconColor();
    }
});

exports.DoorDeviceView = exports.DeviceView.extend({

    template: "#device-list-door-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.updateStatus, this);
        this.readAddress = this.model.getAddressByType("read_door");
    },

    updateSwitch: function(on) {
        this.$('a').removeClass('active');
        if (on) {
            this.$('a.open').addClass('active');
        } else {
            this.$('a.open').removeClass('active');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = this.$('.hit-icon');
        if (on) {
            $widget.data('hit-icon-type',"devices.doorOpen");
            app.changeIconState($widget, 'white');
        } else {
            $widget.data('hit-icon-type',"devices.doorClose");
            app.changeIconState($widget, 'gray');
        }
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.updateStatus(null, value);
    },

    updateStatus: function(address, value){
        this.updateSwitch(value == 1);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.WindowDeviceView = exports.DeviceView.extend({

    template: "#device-list-window-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.updateStatus, this);
        this.readAddress = this.model.getAddressByType("read_window");
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('active');
        if (on) {
            $('a.open', this.$el).addClass('active');
        } else {
            $('a.open', this.$el).removeClass('active');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            $widget.data('hit-icon-type',"devices.windowOpen");
            app.changeIconState($widget, 'white');
        } else {
            $widget.data('hit-icon-type',"devices.windowClose");
            app.changeIconState($widget, 'gray');
        }
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.updateStatus(null, value);
    },

    updateStatus: function(address, value){
        this.updateSwitch(value == 1);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.SocketDeviceView = exports.DeviceView.extend({

    template: "#device-list-socket-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon a": "socketClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_socket");
        this.writeAddress = this.model.getAddressByType("write_socket");
    },

    socketClicked: function (e) {
        e.preventDefault();
        var btnClicked = $(e.currentTarget);
        var on = (btnClicked.data('value') === 'on');

        this.flipSwitch(on);
        this.updateSwitch(on);
    },

    flipSwitch: function(on){
        var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", this.writeAddress, (on ? 1 : 0));
    },

    isSwitchOn: function() {
        return (this.$('.selected').data('value') === 'on');
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
    },

    updateSwitch: function(on) {
        $('a', this.$el).removeClass('selected');
        if (on) {
            $('a[data-value="on"]', this.$el).addClass('selected');
        } else {
            $('a[data-value="off"]', this.$el).addClass('selected');
        }
        this.updateIconColor(on);
    },

    updateIconColor: function(on) {
        var $widget = $('.hit-icon', this.$el);
        if (on) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(value == 1);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.CameraDeviceView = exports.DeviceView.extend({

    template: "#device-list-camera-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        'click .device-btn a' : 'cmdButtonClicked'
    },

    initialize: function() {
        
    },

    /**
     * Renders the optional buttons configured for the camera.
     * */
    renderOptionalButtons: function() {
        var optBtnProps = [ {btnName: 'cmd_opt1_btn_name', cmd: 'cmd_opt1_cmd', address: 'cmd_opt1_read_address' },
                            {btnName: 'cmd_opt2_btn_name', cmd: 'cmd_opt2_cmd', address: 'cmd_opt2_read_address' },
                            {btnName: 'cmd_opt3_btn_name', cmd: 'cmd_opt3_cmd', address: 'cmd_opt3_read_address' } ];

        var optBtns = new Array();
        var $widgetOpts = $('.widget-opts', this.$el);

        _.each(optBtnProps, function(prop) {
            var btnName = this.model.get(prop.btnName);
            var cmd = this.model.get(prop.cmd);
            var address = this.model.get(prop.address);
            if (btnName && cmd) {
                optBtns.push({btnName: btnName, cmd: cmd, address: address});
            }
        }, this);

        if (optBtns.length > 0) {
            var optBtnsClass = "";
            if (optBtns.length === 1) {
                optBtnsClass = "one";
            } else if (optBtns.length === 2) {
                optBtnsClass = "two";
            } else if (optBtns.length === 3) {
                optBtnsClass = "three";
            }

            var template = $('#device-list-camera-optional-buttons-template').html();
            var compiled = _.template(template, {_:_, optBtnsClass: optBtnsClass, optBtns: optBtns});
            
            $widgetOpts.html(compiled);
        } else {
            $widgetOpts.data('hit-icon-type', 'devices.camera');
        }
    },

    cmdButtonClicked: function(e) {
        var $btnClicked = $(e.currentTarget);
        var cmd = $btnClicked.data('cmd');
        var address = $btnClicked.data('address');
        app.vent.trigger("device:camera:command", address, cmd);
    },

    refreshIcon: function() {
        var $widget = $('.hit-icon .widget-opts', this.$el);
        app.changeIconState($widget, '#FFFFFF');
    },

    close: function() {
        if (this.scheduledTask) {
            clearTimeout( this.scheduledTask );
        }
    },

    refreshImg: function() {
        var $img = $('img', this.$el);
        var url = this.model.get('url');
        url += ((url.indexOf('?') != -1) ? '&' : '?') + Math.random();

        $img.attr('src', url);

        var refresh = this.model.get('refresh');
        if (!_.isNaN(refresh)) { 
            var proxy = $.proxy(this.refreshImg, this);
            this.scheduledTask = setTimeout( proxy, parseInt(refresh) );
        }
    },

    setVideoOptions: function() {
        if (this.model.get('autoPlay')) {
            var $video = $('video', this.$el);
            $video.attr('autoplay', 'autoplay');
            $video.click(function() {
                this.webkitRequestFullScreen();
            });
        }
    },

    onRender: function(){
        this.renderOptionalButtons();
        this.refreshIcon();

        if (this.model.get('cameraType') === 'img') {
            this.refreshImg();
        } else if (this.model.get('cameraType') === 'video') {
            this.setVideoOptions();
        }
    }

});

exports.ScenesDeviceView = exports.DeviceView.extend({

    template: "#device-list-scenes-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon": "scenesClicked"
    },

    initialize: function() {
        this.writeAddress = this.model.getAddressByType("write_scenes");
    },

    scenesClicked: function (e) {
        e.preventDefault();
        var btnClicked = $(e.currentTarget);
        var on = true;

        var address = this.writeAddress.get("address");
        app.vent.trigger("device:write", this.writeAddress, (on ? 1 : 0));
    },

    refreshIcon: function() {
        var icon = this.model.get('icon');
        var $widget = $('.hit-icon', this.$el);
        $widget.data('hit-icon-type',icon);
        app.changeIconState($widget, 'white');
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.MotionDeviceView = exports.DeviceView.extend({

    template: "#device-list-motion-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.updateStatus, this);
        this.readAddress = this.model.getAddressByType("read_motion");
    },

    updateMotion: function(on) {
        this.resetAnimation();
        var $widget = this.$('[data-hit-icon-type]');
        if (on) {
            $widget.data('hit-icon-type',"devices.motion");
            app.changeIconState($widget, 'red');
            this.backgroundImage = $widget.css('background-image');
            this.icon = $widget;
            this.refreshImg();
        } else {
            $widget.data('hit-icon-type',"devices.motion");
            app.changeIconState($widget, 'gray');
        }
    },

    setIcon: function() {
        this.iconShowed = true;
        this.icon.css('background-image', this.backgroundImage);
    },

    unsetIcon: function() {
        this.iconShowed = false;
        this.icon.css('background-image', '');
    },

    close: function() {
        this.resetAnimation();
    },

    resetAnimation: function() {
        this.iconShowed = true;
        if (this.scheduledTask) {
            clearTimeout( this.scheduledTask );
        }
    },

    refreshImg: function() {
        if (this.iconShowed) {
            this.unsetIcon();
        } else {
            this.setIcon();
        }

        var proxy = $.proxy(this.refreshImg, this);
        this.scheduledTask = setTimeout(proxy, 200);
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.updateStatus(null, value);
    },

    updateStatus: function(address, value){
        this.updateMotion(value == 1);
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.RgbDeviceView = exports.DeviceView.extend({

    template: "#device-list-rgb-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "mousemove canvas#picker": "onPickerMove",
        "touchmove canvas#picker": "onPickerMove",

        "mousedown canvas#picker": "onPickerDown",
        "touchstart canvas#picker": "onPickerDown",

        "mouseup canvas#picker": "onPickerUp",
        "touchend canvas#picker": "onPickerUp",

        "click .device-btn a": "brightnessChanged"
    },

    initialize: function() {
        // this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readRedAddress = this.model.getAddressByType("read_red_color");
        this.writeRedAddress = this.model.getAddressByType("write_red_color");

        this.readGreenAddress = this.model.getAddressByType("read_green_color");
        this.writeGreenAddress = this.model.getAddressByType("write_green_color");

        this.readBlueAddress = this.model.getAddressByType("read_blue_color");
        this.writeBlueAddress = this.model.getAddressByType("write_blue_color");

        this.readBrightnessAddress = this.model.getAddressByType("read_brightness");
        this.writeBrightnessAddress = this.model.getAddressByType("write_brightness");
    },

    initializeCanvas: function() {
        // create canvas and context objects
        var $canvas = $('#picker', this.$el);
        if ($canvas.length) {
            var canvas = $canvas[0];
            var ctx = canvas.getContext('2d');

            canvas.width = canvas.width;

            // drawing active image
            var image = new Image();
            image.onload = function () {
                ctx.drawImage(image, 0, 0, image.width, image.height); // draw the image on the canvas
            }
            image.src = 'img/colorwheel.png';
        }
    },

    onPickerDown: function(e) {
        this.canPickerMove = true;
        this.initializeCanvas();
        return false;
    },

    onPickerUp: function(e) {
        this.canPickerMove = false;
        this.onPickerChangeColor(e, true);
        return false;
    },

    onPickerMove: function(e) {
        if (this.canPickerMove) {
            this.onPickerChangeColor(e);
        }
        e.preventDefault();
        return false;
    },

    onPickerChangeColor: function (e, isFinalColor) {
        var $canvas = $('#picker', this.$el);
        var canvas = $canvas[0];
        var ctx = canvas.getContext('2d');

        // get coordinates of current position
        var canvasOffset = $canvas.offset();
        var pageX = e.pageX, pageY = e.pageY;

        // Workaround for touch devices
        if (_.isUndefined(e.pageX)) {
            var c = e.originalEvent.targetTouches[0];
            if (_.isUndefined(c)) {
                pageX = this.lastPageX; pageY = this.lastPageY;
            } else {
                pageX = this.lastPageX = c.pageX; pageY = this.lastPageY = c.pageY;
            }
        }

        var canvasX = Math.floor(pageX - canvasOffset.left);
        var canvasY = Math.floor(pageY - canvasOffset.top);

        // get current pixel
        var imageData = ctx.getImageData(canvasX, canvasY, 1, 1);
        var pixel = imageData.data;

        // update preview color
        if ( !(pixel[0] == 0 && pixel[1] == 0 && pixel[2] == 0)) {
            var pixelColor = "rgb("+pixel[0]+", "+pixel[1]+", "+pixel[2]+")";
            this.color = {r: pixel[0], g: pixel[1], b: pixel[2]};

            // Displays the circle pointing the color selected
            if (isFinalColor) {
                ctx.beginPath();
                ctx.arc(canvasX, canvasY, 5, 0, Math.PI*2, true);
                ctx.closePath();
                ctx.lineWidth = 2;
                ctx.strokeStyle = "white";
                ctx.stroke();
            }

            app.vent.trigger("device:write", this.writeRedAddress, this.color.r);
            app.vent.trigger("device:write", this.writeGreenAddress, this.color.g);
            app.vent.trigger("device:write", this.writeBlueAddress, this.color.b);
        }
    },

    brightnessChanged: function(e) {
        e.preventDefault();
        var $control = $(e.currentTarget);

        var changeTemp = ($control.data('value') === 'minus') ? parseFloat("-1") : parseFloat("1");

        var currentBrightness = this.readBrightnessAddress.get("value");
        var brightness = currentBrightness > 0 ? ((currentBrightness + changeTemp) % 101) : 0;

        app.vent.trigger("device:write", this.writeBrightnessAddress, brightness);
    },

    onRender: function(){
        this.initializeCanvas();
    }

});

exports.DeviceGroupView = Backbone.Marionette.CompositeView.extend({
    template: "#device-group-template",
    className: "room-device-group span6 clearfix",
    
    events: {
        "click .addDevice": "addDeviceClicked",
        "click a#editDeviceGroupStyle": "editDeviceGroupClicked"
    },

    itemViewTypes: {
        "switch": exports.SwitchDeviceView,
        "dimmer": exports.DimmerDeviceView,
        "thermostat": exports.ThermostatDeviceView,
        "shutter": exports.ShutterDeviceView,
        "door": exports.DoorDeviceView,
        "window": exports.WindowDeviceView,
        "socket": exports.SocketDeviceView,
        "camera": exports.CameraDeviceView,
        "scenes": exports.ScenesDeviceView,
        "motion": exports.MotionDeviceView,
        "rgb": exports.RgbDeviceView
    },

    initialize: function() {
        var type = this.model.get("type");

        this.collection = this.model.devices;
        this.itemView = this.itemViewTypes[type];

        // Bind event when the devices are removed to check if there devices in the collection
        this.bindTo(this, "item:removed", this.checkEmptyCollection, this);

        this.resizeHandler = $.proxy(this.updateScrollBar, this);
        $(window).on("resize", this.resizeHandler);
    },

    close: function() {
        $(window).off("resize", this.resizeHandler);  
    },

    onRender: function() {
        this.applyStyles();
        this.deviceGroupRendered = true;
        this.setScrollbarOverview();
    },

    initScrollBar: function() {
        var opts = { axis: 'x', invertscroll: app.isTouchDevice() };
        this.$el.find(this.getViewId()).tinyscrollbar(opts);
    },

    updateScrollBar: function() {
        this.$el.find(this.getViewId()).tinyscrollbar_update();
    },

    setScrollbarOverview: function() {
        var $widget = $('.hit-widget', this.$el);
        var $icons = $('.hit-icon', $widget);
        var width = 102;
        if ($widget.hasClass('large')) { width = 192; }
        else if ($widget.hasClass('medium')) { width = 147; } 
        else if ($widget.hasClass('small')) { width = 122; } 
        
        $('.overview', this.$el).setPixels('width', $icons.length * width);
    },

    getViewId: function() {
        var prefix = "#device-group-";
        return prefix + this.model.get("type");
    },

    addDeviceClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:device:addToGroup", roomsController.currentRoom, this.model);
    },

    editDeviceGroupClicked: function(e){
        e.preventDefault();
        app.vent.trigger("room:editDeviceGroup", this);
    },

    appendHtml: function(cv, iv){
        cv.$(".device-list").append(iv.el);
        if (this.deviceGroupRendered) {
            this.applyStyles();
            this.setScrollbarOverview();
            this.updateScrollBar();
        }
    },

    checkEmptyCollection: function() {
        if (this.collection.length == 0) {
            this.trigger('room:device-group:empty', this);
        } else {
            // this.updateScrollBar();
        }
    },

    reorderDevices: function() {
        console.log('reordering devices of the device group');
        var that = this;
        var index = 0;
        this.$('[data-model-id]').each(function(){
            var modelId = $(this).data('model-id');
            that.model.devices.get(modelId).set('order', ++index);
        });

        this.model.devices.sort({silent: true});
        homesController.saveCurrentHome();
    },

    applyStyle: function(styleConfigurationName, context, applySelector, createStylesheet) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            var that = this;
            _.each(selectorArray, function(selector){
                var fullSelector = selector;
                if (context) {
                    fullSelector = context + ' ' + selector;
                }
                that.$(fullSelector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    var classesToRemove = _.pluck(app.colorClasses, 'value').join(' ');
                    that.$(fullSelector).removeClass(classesToRemove).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(fullSelector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(fullSelector).css(configuration.getStyleAttributes());    
                }
            });
        }
    },

    applyStyles: function() {

        this.applyStyle('bodyConfiguration', this.getViewId(), true, true);
        this.applyStyle('titleConfiguration', this.getViewId(), true);

        _.each(_.values(this.children), function(itemView){
            itemView.refreshIcon();
        });
        var proxy = $.proxy(this.reorderDevices, this);
        $(this.getViewId() + ' .device-list', this.$el).sortable({
            update: proxy
        });
        
        $(this.getViewId() + ' .device-list', this.$el).disableSelection();
    }
});

exports.RoomLayout = Backbone.Marionette.CompositeView.extend({

    template: "#room-layout-template",
    id: "room-layout",
    itemView: exports.DeviceGroupView,

    events: {
        "click a.view-home": "viewClicked"
    },

    viewClicked: function(e){
        app.vent.trigger("home:view", this.model);
    },

    serializeData: function(){
        var data = Backbone.Marionette.CompositeView.prototype.serializeData.apply(this, arguments);
        var floor = this.model.collection.parentFloor;
        var home = floor.collection.parentHome;

        data.floor = floor.get("name");
        data.home = home.get("name");

        return data;
    },

    appendHtml: function(cv, iv){
        var $rowContainer = null;
        var $rows = cv.$(".room-devices");
        _.each($rows, function(row) {
            if ($('.room-device-group', row).length < 2) {
                $rowContainer = $(row);
            }
        });

        if (!$rowContainer) {
            $container = $(cv.el);
            $rowContainer = $('<div class="room-devices row-fluid">').appendTo($container);
        }

        $rowContainer.append(iv.el);
    },

    onRender: function() {

        this.bindTo(this, "item:added", this.bindItemViewEvents, this);

        var that = this;
        // Bind event to remove device-group when there no devices of a type
        _.each(this.children, function(view, cid){
            that.bindItemViewEvents(view);
        });
    },

    applyStyle: function(styleConfigurationName, createStylesheet) {

        if (this.model.has(styleConfigurationName)) {
            var configuration = this.model.get(styleConfigurationName);
            var selectorArray = configuration.getSelectors();
            _.each(selectorArray, function(selector){
                $(selector).removeAttr('style');
                var className = configuration.getClassesToApply();
                if (className !== '') {
                    $(selector).addClass(className);
                }
                if (createStylesheet) {
                    var stylesheet = app.generateStylesheet(selector, configuration.getStyleAttributes());
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(configuration.getStyleAttributes());    
                }
                
            });
        }
    },

    applyStyles: function() {
        this.applyStyle('bodyConfiguration', true);
    },

    bindItemViewEvents: function(itemView) {
        this.bindTo(itemView, 'room:device-group:empty', this.removeDeviceGroup, this);
    },

    removeDeviceGroup: function(deviceGroupView) {
        deviceGroupView.model.destroy();
        deviceGroupView.close();
    },

    initializeUIEffects: function() {

        // Initialize the scroll bar component for the device groups
        _.each(this.children, function(view, cid){
            view.initScrollBar();
        });
    }
});

exports.AddRoomForm = Backbone.Marionette.ItemView.extend({
    template: "#room-add-template",
    formFields: ["name", "icon"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    serializeData: function(){
        var data = {};

        if (this.model) { 
            data = this.model.toJSON();
        }
        if (this.options.icons) { 
            data.icons = this.options.icons;
        }
        return data;
    },

    saveClicked: function(e){
        e.preventDefault();

        var data = Backbone.FormHelpers.getFormData(this);
        var room = new Room(data);

        this.trigger("save", room);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    } 
});

exports.EditRoomForm = Backbone.Marionette.ItemView.extend({

    template: "#room-edit-template",

    formFields: ["name", "icon"],

    events: {
        "click .save": "saveClicked",
        "click .cancel": "cancelClicked"
    },

    serializeData: function(){
        var data = {};

        if (this.model) { 
            data = this.model.toJSON();
        }
        if (this.options.icons) { 
            data.icons = this.options.icons;
        }
        return data;
    },

    saveClicked: function(e){
        e.preventDefault();

        var room = this.model;
        var data = Backbone.FormHelpers.getFormData(this);

        room.set({
            name: data.name,
            icon: data.icon
        });
        this.trigger("save", room);

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }    
});

exports.EditStyleRoomForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-room-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile"
    },

    loadFile: function(event){
        var imageFile = event.target.files[0];
        this.previewFile(imageFile);
        
        var that = this;
        var fileName = imageFile.name;

        var reader = new FileReader();
        reader.onload = function (event) {
            that.imageStream = event.target.result;
            that.imageFileName = fileName;
        };

        reader.readAsBinaryString(imageFile);
    },

    previewFile: function(file) {
        
        var previewReader = new FileReader();
        previewReader.onload = function (event) {
            $('#holder').children().remove();
            var image = new Image();
            image.src = event.target.result;
            image.width = 150; // a fake resize
            holder.appendChild(image);
        };

        previewReader.readAsDataURL(file);        
    },

    serializeData: function(){

        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        data.type = 'Room';
        data.bodyFields = this.model.get("bodyFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));

        return data;
    },

    addStyleValues: function(fields, configuration){
        _.each(fields, function(field) {
            if (configuration != null) {
                field.value = configuration.getStyleAttribute(field.id);
            } else {
                field.value = '';
            }
        });
    },

    extractStyle: function(formData, prefix, selector){

        var styleKeys = _.keys(formData);
        var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(prefix) == 0;
        }, this);

        var styleData = _.pick(formData, styleNames);
        var newStyleData = {};
        _.each(styleData, function(value, key){
            if (value != null && value != '') {
                newStyleData[key.substr(prefix.length)] = value;
            }
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    updateStyleConfiguration: function(formData, prefix, selector, attributeName) {

        var configurationAttributes = this.extractStyle(formData, prefix, selector);

        var configuration = this.model.get(attributeName);

        if (configuration == null) {
            configuration = new Configuration();
            this.model.set(attributeName, configuration);
        }

        configuration.resetAttributes();

        configuration.set(configurationAttributes);
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("titleFields"), 'id'), _.pluck(this.model.get("bodyFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        var $lis = $('#device-group-sortable li', this.$el);
        _.each($lis, function(li, idx) {
            var id = $(li).data('model-id');
            var deviceGroup = this.model.deviceGroups.get(id);
            deviceGroup.set('order', idx);
        }, this);
        this.model.deviceGroups.sort({silent: true});

        if (this.imageStream) {
            var that = this;
            $.ajax({
                type: "POST",
                url: "/api/images",
                data: {
                    fileName: that.imageFileName,
                    fileStream: that.imageStream
                },
                success: function (response) {
                    var imagePath = response.imagePath;
                    data['body-background-image'] = 'url(' + imagePath + ')';
                    that.updateStyleConfiguration(data, that.model.bodyPrefix, that.model.bodySelector, "bodyConfiguration");

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {
            this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");

            this.result = {
                status: "OK"
            }

            this.close();
        }
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        }

        this.close();
    },

    onRender: function() {
        $('#device-group-sortable', this.$el).sortable();
        $('#device-group-sortable', this.$el).disableSelection();
    }
});