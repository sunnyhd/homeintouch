var app = require('app');
var DeviceView = require('views/devices/abstract_device');

module.exports = DeviceView.extend({

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
        try {
            this.$('.slider-horizontal').slider("value", value);
        } catch(err) {
            console.log('Dimmer Slider is not initialized');
            this.initializeDimmerSlider();

            this.$('.slider-horizontal').slider("value", value);
        }
    },

    updateDimmerDetail: function(value) {
        this.$('.dimmer-detail').html(Math.ceil(value) + '%');
    },

    selectSwitch: function(value){
        this.$('.hit-icon').data('value', value);
        this.refreshIcon(value);
    },

    isSwitchOn: function() {
        return (this.$('.hit-icon').data('value') === Number(this.model.get('on_value')));
    },

    refreshIcon: function() {
        this.updateIconColor(this.isSwitchOn());
    },

    updateIconColor: function(on) {
        var $widget = this.$('.hit-icon');
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

        console.log('Select Dimmer, value: ' + value);

        this.updateDimmerDetail(value);
        this.updateDimmerSlider(value);
    },

    changeReadDimmer: function(address){

        console.log('changeReadDimmer: this.setReadValue = ' + this.setReadValue);
        if (this.setReadValue) {
            this.updateDimmerDetail(address.get('value'));    
            this.updateDimmerSlider(address.get('value'));
        }
        this.setReadValue = false;
    },

    onSliderStart: function(e, ui) {
        this.$(".slider-horizontal").data('sliding', 'true');
    },

    onSliderStop: function(e, ui) {
        this.$(".slider-horizontal").data('sliding', 'false');
        this.dimmerChanged(e);
    },

    onSliderMoving: function(e, ui) {
        var value = Number(ui.value);

        this.currentMovsAmount++;
        this.updateDimmerDetail(value);

        if (this.currentMovsAmount >= 3) { // Send to the HIT server each 5 slider movements
            this.currentMovsAmount = 0;
            var $dimmer = this.$(".slider-horizontal");
            $dimmer.data('sliding', 'false');
            $dimmer.slider("value", value);
            this.dimmerChanged(e);
        }
    },

    onRender: function(){
        var value = this.readSwitch.get("value");

        this.updateSwitch(null, value);

        this.currentMovsAmount = 0;

        this.initializeDimmerSlider();

        this.setReadValue = true;
        this.changeReadDimmer(this.readDimmer);
    },

    initializeDimmerSlider: function() {
        var onSliderStart = $.proxy(this.onSliderStart, this);
        var onSliderStop = $.proxy(this.onSliderStop, this);
        var onSliderMoving = $.proxy(this.onSliderMoving, this);
        this.$(".slider-horizontal").slider({
            range: "min", min: 0, max: 100,
            start: onSliderStart,
            stop: onSliderStop,
            slide: onSliderMoving
        });
    }
});