var app = require('app');
var DeviceView = require('views/devices/abstract_device');

module.exports = DeviceView.extend({

    template: "#device-list-shutter-item-template",

    className: "hit-icon-wrapper",

    formEvents: {
        'click div.shutter-container': 'shutterClicked'        
    },

    initialize: function(){
        this.readPosition = this.model.getAddressByType("read_position");
        this.writePosition = this.model.getAddressByType("write_position");
        this.writeSwitch = this.model.getAddressByType("write_switch");
        this.writeStop = this.model.getAddressByType("write_stop");

        this.minValue = Number(this.model.get('min_value'));
        this.maxValue = Number(this.model.get('max_value'));

        this.shutterHeight = 73;

        this.initializeEventHandlers();

        this.shutterUrl = app.getImgUrl('devices.shutter', 'white');
        this.activeShutterUrl = app.getImgUrl('devices.shutter', 'red');

        this.bindTo(this.readPosition, "change:value", this.showPosition, this);
    },

    serializeData: function() {
        var json = DeviceView.prototype.serializeData.apply(this);
        json.shutterUrl = this.shutterUrl;
        json.activeShutterUrl = this.activeShutterUrl;
        return json;
    },

    initializeEventHandlers: function() {

        this.proxyShutterMouseDown = $.proxy(this.shutterMouseDown, this);
        this.proxyShutterMouseMove = $.proxy(this.shutterMouseMove, this);
        this.proxyShutterMouseUp = $.proxy(this.shutterMouseUp, this);

        // Create Touch Handlers

        var touchStartHandler = function(event) {   
            if( 1 === event.touches.length )
            {
                this.proxyShutterMouseDown(event.touches[0]);
                event.stopPropagation();
            }
        };

        var touchMoveHandler = function(event) {
            event.preventDefault();
            this.proxyShutterMouseMove(event.touches[0]);
        };

        var touchEndHandler = function(event) {
            event.preventDefault();
            this.proxyShutterMouseUp(event.touches[0]);
        };

        this.proxyTouchStartHandler = $.proxy(touchStartHandler, this);
        this.proxyTouchMoveHandler = $.proxy(touchMoveHandler, this);
        this.proxyTouchEndHandler = $.proxy(touchEndHandler, this);
    },

    shutterMouseDown: function(event) {
        this.pageY = event.pageY;

        if (app.isTouchDevice()) {
           document.ontouchmove = this.proxyTouchMoveHandler;
           document.ontouchend = this.proxyTouchEndHandler;
           this.$shutterContainer[0].ontouchmove = this.proxyTouchMoveHandler;
           this.$shutterWidget[0].ontouchend = this.proxyTouchEndHandler;
        } else {
            this.$document.bind('mousemove', this.proxyShutterMouseMove);
            this.$document.bind('mouseup', this.proxyShutterMouseUp);
            this.$shutterWidget.bind('mouseup', this.proxyShutterMouseUp);
            this.$shutterContainer.bind('mousemove', this.proxyShutterMouseMove);
        }

        return false;
    },

    shutterMouseMove: function(event) {

        var currentShutterMargin = this.$shutterWidget.getPixels('margin-top');
        var positionDiff = currentShutterMargin - (this.pageY - event.pageY);

        if (positionDiff > 0 || positionDiff < (-this.shutterHeight)) {
            return false;
        }

        var shutterPct = 100 - (Math.abs(positionDiff) * 100) / this.shutterHeight;
        this.$shutterDetail.html(Math.ceil(shutterPct) + '%');
        this.$shutterWidget.setPixels('margin-top', positionDiff);

        return false;
    },

    shutterMouseUp: function() {
        if (app.isTouchDevice()) {
           document.ontouchmove = null;
           document.ontouchend = null;
           this.$shutterContainer[0].ontouchmove = null;
           this.$shutterWidget[0].ontouchend = null;
        } else {
            this.$document.unbind('mousemove', this.proxyShutterMouseMove);
            this.$document.unbind('mouseup', this.proxyShutterMouseUp);
            this.$shutterWidget.unbind('mouseup', this.proxyShutterMouseUp);
            this.$shutterContainer.unbind('mousemove', this.proxyShutterMouseMove);
        }

        this.finishedDragging = true;
        this.positionChanged(this.getShutterValue());

        return false;
    },

    getShutterValue: function() {
        var currentShutterMargin = this.$shutterWidget.getPixels('margin-top');
        var shutterPct = 100 - (Math.abs(currentShutterMargin) * 100) / this.shutterHeight;
        return Math.ceil(shutterPct);
    },

    shutterClicked: function() {

        if (this.finishedDragging) {
            this.finishedDragging = false;
            return false;
        }

        var actualValue = this.calculateShutterValue(this.readPosition.get('value'));

        if (this.moving) {
            // The shutter stops
            this.stopShutter();
            this.moving = false;
            this.updateShutterIcon();
        } else {
            // The shutter starts sliding 
            if (actualValue >= 0 && actualValue <= 50) {
                // The shutter goes down
                this.switchUpDown(false);
            } else {
                // The shutter goes up
                this.switchUpDown(true);
            }

            this.moving = true;
            this.updateShutterIcon();
        }

        return false;
    },

    upClicked: function(e){
        this.switchUpDown(this.minValue < this.maxValue);
        return false;
    },

    downClicked: function(e){
        this.switchUpDown(this.minValue > this.maxValue);
        return false;
    },

    stopShutter: function(){
        var address = this.writeStop.get("address");
        app.vent.trigger("device:write", this.writeStop, 1);
    },

    switchUpDown: function(up){
        var address = this.writeSwitch.get("address");
        app.vent.trigger("device:write", this.writeSwitch, (up ? 1 : 0));
    },

    showPosition: function(address, value){

        var actualValue = this.calculateShutterValue(value);
        this.updateShutterDetails(actualValue);

        this.moving = false;
        this.updateShutterIcon();
    },

    updateShutterDetails: function(shutterValue) {
        this.refreshIcon(shutterValue);
        this.$shutterDetail.html(Math.ceil(shutterValue) + '%');
    },

    refreshIcon: function(value) {

        var $frameWidget = $('.hit-icon', this.$el);
        app.changeIconState($frameWidget, '#FFFFFF');

        var shutterPosition = (this.shutterHeight/100) * value;
        var shutterMargin = (-(this.shutterHeight) + shutterPosition);

        this.$shutterWidget.setPixels('margin-top', shutterMargin);
    },

    positionChanged: function(value) {
        var actualValue = this.calculateShutterValue(value);
        var address = this.writePosition.get("address");
        app.vent.trigger("device:write", this.writePosition, actualValue);
    },

    onRender: function(){

        this.$document = $(document);

        this.$shutterDetail = this.$('.shutter-detail');

        this.$shutterContainer = this.$('div.shutter-container');
        this.$shutterWidget = this.$shutterContainer.children('img');

        this.showPosition(null, this.readPosition.get("value"));

        if (app.isTouchDevice()) {
            this.$shutterWidget[0].ontouchstart = this.proxyTouchStartHandler;
        } else {
            this.$shutterWidget.bind('mousedown', this.proxyShutterMouseDown);
        }
    },

    calculateShutterValue: function(value) {

        var shutterValue = value;

        if (this.maxValue < this.minValue) {
            shutterValue = this.minValue - value;
        }

        return shutterValue;        
    },

    updateShutterIcon: function() {
        this.resetAnimation();

        if (this.moving) {
            this.setIcon();
            this.refreshImg();
        } else {
            this.unsetIcon();
        }
    },

    setIcon: function() {
        this.iconShowed = true;
        this.$shutterWidget.attr('src', this.activeShutterUrl);
    },

    unsetIcon: function() {
        this.iconShowed = false;
        this.$shutterWidget.attr('src', this.shutterUrl);
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
    }
});