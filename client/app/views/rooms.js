var app = require('app');
var roomsController = require('controllers/rooms');
var homesController = require('controllers/homes');
var Room = require('models/room');
var Configuration = require('models/configuration');
var DPT_Transfomer = require('lib/dpt');
var StyleConfigurationView = require('views/settings/style_settings');

exports.DeviceView = require('views/devices/abstract_device');
exports.ShutterDeviceView = require('views/devices/shutter');

exports.OptionsContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-room-opts",

    events: {
        'click a.add-device': 'addDeviceTypeHandler',
        'click a#room-settings': 'editRoomHandler',
        'click a#editStyle': 'editStyle'
    },

    addDeviceTypeHandler: function(e) {
        e.preventDefault();
        app.vent.trigger("room:addDeviceGroup", roomsController.currentRoom);
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
        app.vent.trigger("room:addDeviceGroup", roomsController.currentRoom);
    }
});

exports.NoRoomsView = Backbone.Marionette.ItemView.extend({
    template: "#no-rooms-template"
});

exports.NoDeviceGroupView = Backbone.Marionette.ItemView.extend({
    template: "#no-device-group-template",
});

exports.SwitchDeviceView = exports.DeviceView.extend({

    template: "#device-list-switch-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon": "switchClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_switch");
        this.writeAddress = this.model.getAddressByType("write_switch");
    },

    switchClicked: function (e) {
        e.preventDefault();
        var widget = $(e.currentTarget);
        
        var currentValue = widget.data('value');
        var on = widget.data('on-value');
        var off = widget.data('off-value');

        // Gets the new value to be set
        var value = (currentValue === on) ? off : on;

        this.flipSwitch(value);
        this.updateSwitch(value);
    },

    flipSwitch: function(value){
        app.vent.trigger("device:write", this.writeAddress, value);
    },

    isSwitchOn: function() {
        return (this.$('.hit-icon').data('value') === Number(this.model.get('on_value')));
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateSwitch: function(value) {
        $('.hit-icon', this.$el).data('value', value);
        this.updateIconColor(value);
    },

    updateIconColor: function(value) {
        var $widget = $('.hit-icon', this.$el);
        if (value === Number(this.model.get('on_value'))) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(Number(value));
    },

    onRender: function(){
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
        this.refreshIcon();
    }

});

exports.DimmerDeviceView = exports.DeviceView.extend({

    template: "#device-list-dimmer-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon": "switchClicked"
    },

    initialize: function(){
        this.readSwitch = this.model.getAddressByType("read_switch");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.readDimmer = this.model.getAddressByType("read_dimmer");
        this.writeDimmer = this.model.getAddressByType("write_dimmer");

        this.dimmerChanged = _.debounce(this.dimmerChanged, 500);

        this.setReadValue = true;
        console.log('initialize: this.setReadValue = ' + this.setReadValue);

        this.bindTo(this.readDimmer, "change", this.changeReadDimmer, this);

        this.bindTo(this.writeDimmer, "change:value", this.selectDimmer, this);
        this.bindTo(this.readSwitch, "change:value", this.updateSwitch, this);
    },

    switchClicked: function (e) {
        e.preventDefault();
        var widget = $(e.currentTarget);
        
        var currentValue = widget.data('value');
        var on = widget.data('on-value');
        var off = widget.data('off-value');

        // Gets the new value to be set
        var value = (currentValue === on) ? off : on;
        this.flipSwitch(value);

        this.setReadValue = true;
        console.log('switchClicked: this.setReadValue = ' + this.setReadValue);
    },

    dimmerChanged: function(e){
        var $dimmer = this.$el.find('.slider-horizontal');
        var value = parseInt( $dimmer.slider("value") );
        var address = this.writeDimmer.get("address");

        this.updateDimmerDetail(value);
        app.vent.trigger("device:write", this.writeDimmer, value);
    },

    flipSwitch: function(value){
        app.vent.trigger("device:write", this.writeSwitch, value);
    },

    updateDimmerSlider: function(value) {
        this.$el.find('.slider-horizontal').slider("value", value);
    },

    updateDimmerDetail: function(value) {
        $('.dimmer-detail', this.$el).html(Math.ceil(value) + '%');
    },

    selectSwitch: function(value){
        $('.hit-icon', this.$el).data('value', value);
        this.refreshIcon(value);
    },

    isSwitchOn: function() {
        return (this.$('.hit-icon').data('value') === Number(this.model.get('on_value')));
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
        this.selectSwitch(Number(value));
        this.setReadValue = true;
    },

    selectDimmer: function(address, value){
        if (this.dimmerTimeout) return;

        this.updateDimmerSlider(value);
        this.updateDimmerDetail(value);
    },

    changeReadDimmer: function(address){

        console.log('changeReadDimmer: this.setReadValue = ' + this.setReadValue);
        if (this.setReadValue) {
            this.updateDimmerSlider(address.get('value'));
            this.updateDimmerDetail(address.get('value'));    
        }
        this.setReadValue = false;
    },

    onSliderStart: function(e, ui) {
        this.$el.find(".slider-horizontal").data('sliding', 'true');
    },
    onSliderStop: function(e, ui) {
        this.$el.find(".slider-horizontal").data('sliding', 'false');
        this.dimmerChanged(e);
    },
    onSliderMoving: function(e, ui) {
        var value = Number(ui.value);

        this.currentMovsAmount++;
        this.updateDimmerDetail(value);

        if (this.currentMovsAmount >= 3) { // Send to the HIT server each 5 slider movements
            this.currentMovsAmount = 0;
            var $dimmer = this.$el.find(".slider-horizontal");
            $dimmer.data('sliding', 'false');
            $dimmer.slider("value", value);
            this.dimmerChanged(e);
        }
    },

    onRender: function(){
        var value = this.readSwitch.get("value");

        this.updateSwitch(null, value);

        this.currentMovsAmount = 0;

        var onSliderStart = $.proxy(this.onSliderStart, this);
        var onSliderStop = $.proxy(this.onSliderStop, this);
        var onSliderMoving = $.proxy(this.onSliderMoving, this);
        this.$el.find(".slider-horizontal").slider({
            range: "min", min: 0, max: 100,
            start: onSliderStart,
            stop: onSliderStop,
            slide: onSliderMoving
        });        
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
        this.readSetPoint.on("change", this.updateSetPoint, this);
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

        if (mode !== "comfort") {
            this.$('.thermostat-control a').addClass('disabled');
        } else {
            this.$('.thermostat-control a').removeClass('disabled');
        }
    },

    setpointChanged: function(e){
        e.preventDefault();
        var $control = $(e.currentTarget);
        if ($control.hasClass('disabled')) {
            return;
        }

        var step = Number(this.model.get("step"));
        console.log('Thermostat step: ' + step);

        var changeTemp = (($control.data('value') === 'minus') ? -1 : 1) * step;

        console.log('ChangeTemp: ' + changeTemp);

        var currentPoint = this.readSetPoint.get("value");
        var setpoint = currentPoint + changeTemp;
        console.log('New Set Point: ' + setpoint);

        app.vent.trigger("device:write", this.writeSetPoint, setpoint);
    },

    showMode: function(address, mode){
        this.updateModeButton(mode);
    },

    showSetPoint: function(address, setPoint){
        this.$(".setpoint").html(setPoint.toFixed(2) + "&nbsp;");
    },

    updateSetPoint: function(address){
      this.$(".setpoint").html(address.get("value").toFixed(2) + "&nbsp;");  
    },

    showTemperature: function(address, temperature){
        this.$(".temperature").html(temperature.toFixed(2) + "&nbsp;");
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
    },

    close: function() {
        Backbone.Marionette.ItemView.prototype.close.apply(this);
        this.readSetPoint.off();
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
        this.updateSwitch(Number(value) == Number(this.model.get('open_value')));
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
        this.updateSwitch(Number(value) == Number(this.model.get('open_value')));
    },

    onRender: function(){
        this.refreshIcon();
    }

});

exports.SocketDeviceView = exports.DeviceView.extend({

    template: "#device-list-socket-item-template",
    className: "hit-icon-wrapper",

    formEvents: {
        "click .hit-icon": "socketClicked"
    },

    initialize: function() {
        this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
        this.readAddress = this.model.getAddressByType("read_socket");
        this.writeAddress = this.model.getAddressByType("write_socket");
    },

    socketClicked: function (e) {
        e.preventDefault();
        var widget = $(e.currentTarget);
        
        var currentValue = widget.data('value');
        var on = widget.data('on-value');
        var off = widget.data('off-value');

        // Gets the new value to be set
        var value = (currentValue === on) ? off : on;

        this.flipSwitch(value);
        this.updateSwitch(value);
    },

    flipSwitch: function(value){
        app.vent.trigger("device:write", this.writeAddress, value);
    },

    refreshIcon: function() {
        var value = this.readAddress.get("value");
        this.selectSwitch(null, value);
    },

    updateSwitch: function(value) {
        $('.hit-icon', this.$el).data('value', value);
        this.updateIconColor(value);
    },

    updateIconColor: function(value) {
        var $widget = $('.hit-icon', this.$el);
        if (value === Number(this.model.get('on_value'))) {
            app.changeIconState($widget, '#FF9522');
        } else {
            app.changeIconState($widget, 'gray');
        }
    },

    selectSwitch: function(address, value){
        this.updateSwitch(Number(value));
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
        $img.die().click(function() {
            this.webkitRequestFullScreen();
        });

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
        this.updateMotion(Number(value) == Number(this.model.get('on_value')));
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
        Backbone.Marionette.CompositeView.prototype.close.apply(this);
    },

    onRender: function() {
        this.applyStyles();
        this.deviceGroupRendered = true;
        this.setScrollbarOverview();
    },

    initScrollBar: function() {
        var opts = { axis: 'x', invertscroll: app.isTouchDevice() };
        $(this.getViewId()).tinyscrollbar(opts);
    },

    updateScrollBar: function() {
        var $view = $(this.getViewId());
        var tsb = $view.data('tsb');
        if ( $view.length > 0 && tsb ) {
            $view.tinyscrollbar_update();
        }
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
        /*var proxy = $.proxy(this.reorderDevices, this);
        $(this.getViewId() + ' .device-list', this.$el).sortable({
            update: proxy
        });
        
        $(this.getViewId() + ' .device-list', this.$el).disableSelection();*/
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

    applyStyle: function(styleConfigurationName, createStylesheet, defaultStyleConfiguration) {

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
                    var stylesheet = app.generateStylesheet(selector, configuration.getStyleAttributes(defaultStyleConfiguration));
                    app.addStyleTag(stylesheet);
                } else {
                    $(selector).css(configuration.getStyleAttributes(defaultStyleConfiguration));
                }
                
            });
        }
    },

    applyStyles: function() {
        var bodyPatternConfiguration = app.controller('homes').currentHome.getDefaultBackgroundStyle();
        this.applyStyle('bodyConfiguration', true, bodyPatternConfiguration);
    },

    bindItemViewEvents: function(itemView) {
        this.bindTo(itemView, 'room:device-group:empty', this.removeDeviceGroup, this);
    },

    removeDeviceGroup: function(deviceGroupView) {
        deviceGroupView.model.destroy();
        deviceGroupView.close();
    },

    close: function() {
        roomsController.currentRoom = null;
    },

    initializeUIEffects: function() {

        // Initialize the scroll bar component for the device groups
        _.each(this.children, function(view, cid){
            view.initScrollBar();
        });
    }
});

// FAVORITE VIEWS

exports.OptionsFavoriteContextMenuView = Backbone.Marionette.ItemView.extend({
    template: "#context-menu-favorite-opts",

    events: {
        'click a#editStyle': 'editStyle'
    },

    editStyle: function() {
        app.vent.trigger("favorites:editStyle", this.model);
    }
});

exports.FavoriteDeviceGroupView = exports.DeviceGroupView.extend({

    events: {
        "click a#editDeviceGroupStyle": "editDeviceGroupClicked"
    },

    editDeviceGroupClicked: function() {

        app.vent.trigger("favorites:editDeviceGroup", this);
        return false;
    },

    appendHtml: function(cv, iv) {
        exports.DeviceGroupView.prototype.appendHtml.apply(this, arguments);
        iv.events = function () {
            return this.formEvents;
        };
        iv.delegateEvents();
    },

    onRender: function() {
        exports.DeviceGroupView.prototype.onRender.apply(this, arguments);
        //$('ul.nav.pull-right', this.$el).hide();
    }
});

exports.EditStyleFavoriteGroupForm = StyleConfigurationView.extend({

    template: "#edit-group-of-favorite-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    initialize: function() {
        StyleConfigurationView.prototype.initialize.apply(this);
        this.deviceGroup = this.options.deviceGroup;
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.deviceGroup = this.deviceGroup.toJSON();

        return data;
    },

    editClicked: function(e){
        this.updateOrderData();

        this.result = {
            status: "OK"
        }

        this.close();

        return false;
    },

    updateOrderData: function() {

        var sortKey = 'sort-' + this.deviceGroup.get('type');
        var widgetOrder = [];
        var $lis = $('#favorite-widgets-sortable li', this.$el);
        _.each($lis, function(li, idx) {
            var id = $(li).data('model-id');
            widgetOrder.push(id);
        }, this);
        this.model.set(sortKey, widgetOrder);
    },

    onRender: function() {
        $('#favorite-widgets-sortable', this.$el).sortable();
        $('#favorite-widgets-sortable', this.$el).disableSelection();
    }
});

exports.FavoriteRoomLayout = exports.RoomLayout.extend({

    itemView: exports.FavoriteDeviceGroupView,

    serializeData: function(){
        var data = Backbone.Marionette.CompositeView.prototype.serializeData.apply(this, arguments);
        var home = this.model.parentHome;

        data.home = home.get("name");

        return data;
    },

    applyStyles: function() {
        var currentModel = this.model;
        this.model = this.model.parentHome;

        var bodyPatternConfiguration = this.model.getDefaultBackgroundStyle();

        this.applyStyle('favoritesConfiguration', true, bodyPatternConfiguration);
        this.applyStyle('favoritesTitleConfiguration');
        this.applyStyle('favoritesBodyConfiguration');

        this.model = currentModel;
    }
});

exports.FavoriteNoDeviceGroupView = Backbone.Marionette.ItemView.extend({
    template: "#favorite-no-device-group-template",
});

exports.EditStyleFavoriteForm = StyleConfigurationView.extend({

    template: "#edit-favorite-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile",
        "click a#clear-background" : "clearBackgroundClicked",
        "show a[data-toggle='tab'][href='#tab1']" : 'showStyleTab',
        "show a[data-toggle='tab'][href='#tab2']" : 'showOrderTab'
    },

    initialize: function() {
        StyleConfigurationView.prototype.initialize.apply(this);
        this.room = this.options.room;
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.type = 'Favorites';
        data.bodyFields = this.model.get("favoritesFields");

        data.favoritesTitleFields = this.model.get("favoritesTitleFields");
        data.favoritesBodyFields = this.model.get("favoritesBodyFields");

        this.addStyleValues(data.bodyFields, this.model.get("favoritesConfiguration"));

        this.addStyleValues(data.favoritesTitleFields, this.model.get("favoritesTitleConfiguration"));
        this.addStyleValues(data.favoritesBodyFields, this.model.get("favoritesBodyConfiguration"));

        data.widgets = this.room.deviceGroups.toJSON();

        return data;
    },

    showOrderTab: function() {
        this.hideClearBackgroundBtn();
    },

    showStyleTab: function() {
        this.setFileUploadSettings();
    },

    onRender: function() {
        StyleConfigurationView.prototype.onRender.apply(this);
        this.setFileUploadSettings();

        $('#widget-sortable', this.$el).sortable();
        $('#widget-sortable', this.$el).disableSelection();
    },

    loadFile: function(event) {
        StyleConfigurationView.prototype.loadFile.apply(this, [event]);
    },

    clearBackgroundClicked: function() {
        StyleConfigurationView.prototype.clearBackgroundClicked.apply(this);
    },

    setFileUploadSettings: function() {
        this.previewLoadedImage();
    },

    updateModelData: function(data) {
        this.updateStyleConfiguration(data, this.model.favoritesPrefix, this.model.favoritesSelector, "favoritesConfiguration");

        this.updateStyleConfiguration(data, this.model.favoritesTitlePrefix, this.model.favoritesTitleSelector, "favoritesTitleConfiguration");
        this.updateStyleConfiguration(data, this.model.favoritesBodyPrefix, this.model.favoritesBodySelector, "favoritesBodyConfiguration");

        this.updateOrderData();
    },

    updateOrderData: function() {
        var widgetOrder = [];
        var $lis = $('#widget-sortable li', this.$el);
        _.each($lis, function(li, idx) {
            var id = $(li).data('model-id');
            widgetOrder.push(id);
        }, this);
        this.model.set('favoritesWidgetOrder', widgetOrder);
    },

    clearStyleModel: function() {
        StyleConfigurationView.prototype.clearStyleModel.apply(this);
        this.model.get('favoritesConfiguration').unsetFileAttribute();
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("favoritesFields"), 'id'),
                                 _.pluck(this.model.get("favoritesTitleFields"), 'id'),
                                 _.pluck(this.model.get("favoritesBodyFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

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
                    that.updateStyleConfiguration(data, that.model.favoritesPrefix, that.model.favoritesSelector, "favoritesConfiguration");
                    
                    that.updateStyleConfiguration(data, that.model.favoritesTitlePrefix, that.model.favoritesTitleSelector, "favoritesTitleConfiguration");
                    that.updateStyleConfiguration(data, that.model.favoritesBodyPrefix, that.model.favoritesBodySelector, "favoritesBodyConfiguration");

                    that.updateOrderData();

                    that.result = {
                        status: "OK"
                    }

                    that.close();
                }
            });      
        } else {

            this.updateModelData(data);

            this.result = {
                status: "OK"
            }

            this.close();
        }
    }
});

// FORMS

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

exports.EditStyleRoomForm = StyleConfigurationView.extend({

    template: "#edit-room-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked",
        "change #body-background-image" : "loadFile",
        "click a#clear-background" : "clearBackgroundClicked"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.type = 'Room';
        data.bodyFields = this.model.get("bodyFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));

        return data;
    },

    clearStyleModel: function() {
        StyleConfigurationView.prototype.clearStyleModel.apply(this);
        this.model.get('bodyConfiguration').unsetFileAttribute();
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

    onRender: function() {
        $('#device-group-sortable', this.$el).sortable();
        $('#device-group-sortable', this.$el).disableSelection();
    }
});