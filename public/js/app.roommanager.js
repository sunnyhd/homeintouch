HomeInTouch.RoomManager = (function(HIT, Backbone, _, $){
  var RoomManager = {};

  // Views
  // -----

  RoomManager.RoomLayout = Backbone.Marionette.Layout.extend({
    template: "#room-layout-template",

    regions: {
      deviceList: ".room-devices"
    },

    events: {
      "click button.addDeviceType": "addDeviceTypeClicked"
    },

    serializeData: function(){
      var data = Backbone.Marionette.Layout.prototype.serializeData.apply(this, arguments);
      var floor = this.model.collection.parentFloor;
      var home = floor.collection.parentHome;

      data.floor = floor.get("name");
      data.home = home.get("name");

      return data;
    },

    addDeviceTypeClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("room:addDeviceGroup", this.model);
    },

    onRender: function(){
      showRoomDevices(this, this.model);
    }
  });

  // Base view for device items in the list
  RoomManager.DeviceView = Backbone.Marionette.ItemView.extend({
    tagName: "li",

    events: function(){
      var events = {
        "click a": "deviceClicked"
      };
      return _.extend(events, this.formEvents);
    },

    constructor: function(){
      Backbone.Marionette.ItemView.prototype.constructor.apply(this, arguments);
      this.model.addresses.each(function(address){
        var type = address.get("type");
        var address = address.get("address");
        if (/read.*/.test(type)){
          HIT.vent.trigger("device:read", address);
        }
      });
    },

    deviceClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("device:selected", this.model);
    }
  });

  RoomManager.SwitchDeviceView = RoomManager.DeviceView.extend({
    template: "#device-list-switch-item-template",

    formEvents: {
      "click .switch .btn.on": "switchOnClicked",
      "click .switch .btn.off": "switchOffClicked"
    },

    initialize: function(){
      this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
      this.readAddress = this.model.getAddressByType("read_switch");
      this.writeAddress = this.model.getAddressByType("write_switch");
    },

    switchOnClicked: function(){
      this.flipSwitch(true);
    },

    switchOffClicked: function(){
      this.flipSwitch(false);
    },

    flipSwitch: function(on){
      var address = this.writeAddress.get("address");
      HIT.vent.trigger("device:write", address, on);
    },

    selectSwitch: function(address, value){
      var $btnSwitch;
      if (value){
        $btnSwitch = this.$(".switch .btn.on");
      } else {
        $btnSwitch = this.$(".switch .btn.off");
      }
      $btnSwitch.button("toggle");
    },

    onRender: function(){
      var value = this.readAddress.get("value");
      this.selectSwitch(null, value);
    }
  });

  RoomManager.DimmerDeviceView = RoomManager.DeviceView.extend({
    template: "#device-list-dimmer-item-template",

    formEvents: {
      "click .switch .btn.on": "switchOnClicked",
      "click .switch .btn.off": "switchOffClicked",
      "change .dimmer": "dimmerChanged",
    },

    initialize: function(){
      this.readSwitch = this.model.getAddressByType("read_switch");
      this.writeSwitch = this.model.getAddressByType("write_switch");
      this.readDimmer = this.model.getAddressByType("read_dimmer");
      this.writeDimmer = this.model.getAddressByType("write_dimmer");

      // Throttle the changes a bit, so we don't flood the server
      this.dimmerChanged = _.throttle(this.dimmerChanged, 50);

      this.bindTo(this.readDimmer, "change:value", this.selectDimmer, this);
      this.bindTo(this.readSwitch, "change:value", this.selectSwitch, this);
    },

    switchOnClicked: function(){
      this.flipSwitch(true);
    },

    switchOffClicked: function(){
      this.flipSwitch(false);
    },

    dimmerChanged: function(e){
      var $dimmer = $(e.currentTarget);
      var value = parseInt($dimmer.val());
      var address = this.writeDimmer.get("address");
      HIT.vent.trigger("device:write", address, value);
    },

    flipSwitch: function(on){
      var address = this.writeSwitch.get("address");
      HIT.vent.trigger("device:write", address, on);
    },

    selectSwitch: function(address, value){
      var $btnSwitch;
      if (value){
        $btnSwitch = this.$(".switch .btn.on");
      } else {
        $btnSwitch = this.$(".switch .btn.off");
      }
      $btnSwitch.button("toggle");
    },

    selectDimmer: function(address, value){
      var $dimmer = this.$(".dimmer");
      $dimmer.val(value);
    },

    onRender: function(){
      var value = this.readSwitch.get("value");
      this.selectSwitch(null, value);
    }
  });

  RoomManager.ShutterDeviceView = RoomManager.DeviceView.extend({
    template: "#device-list-shutter-item-template",

    formEvents: {
      "click .up": "upClicked",
      "click .down": "downClicked",
      "click .stop": "stopClicked",
      "change .position": "positionChanged"
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
      this.switchUpDown(false);
    },

    downClicked: function(e){
      e.preventDefault();
      this.switchUpDown(true);
    },

    stopClicked: function(e){
      e.preventDefault();
      var address = this.writeStop.get("address");
      HIT.vent.trigger("device:write", address);
    },

    positionChanged: function(e){
      var $position = $(e.currentTarget);
      var value = parseInt($position.val());
      var address = this.writePosition.get("address");
      HIT.vent.trigger("device:write", address, value);
    },

    switchUpDown: function(moveDown){
      var address = this.writeSwitch.get("address");
      HIT.vent.trigger("device:write", address, moveDown);
    },

    showPosition: function(address, value){
      this.$("input.position").val(value);
    },

    onRender: function(){
      var position = this.readPosition.get("value");
      this.showPosition(null, position);
    }
  });

  RoomManager.ThermostatDeviceView = RoomManager.DeviceView.extend({
    template: "#device-list-thermostat-item-template",

    formEvents: {
      "click .mode .btn": "modeClicked",
      "change .setpoint input": "setpointChanged"
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
      HIT.vent.trigger("device:write", address, mode);
    },

    setpointChanged: function(e){
      var setpoint = $(e.currentTarget).val();
      var address = this.writeSetPoint.get("address");
      HIT.vent.trigger("device:write", address, setpoint);
    },

    showMode: function(address, mode){
      mode = this.modes[mode];
      this.$(".mode .btn").removeClass("active");
      this.$(".btn." + mode).addClass("active");
    },

    showSetPoint: function(address, setPoint){
      this.$("input.setpoint").val(setPoint);
    },

    showTemperature: function(address, temperature){
      this.$("input.actual").val(temperature);
    },

    onRender: function(){
      var mode = this.readMode.get("value");
      this.showMode(null, mode);

      var setPoint = this.readSetPoint.get("value");
      this.showSetPoint(null, setPoint);

      var temperature = this.readTemperature.get("value");
      this.showTemperature(null, temperature);
    }
  });

  RoomManager.DeviceGroupView = Backbone.Marionette.CompositeView.extend({
    template: "#device-group-template",
    className: "room-device-group span4",

    events: {
      "click button.addDevice": "addDeviceClicked"
    },

    itemViewTypes: {
      "switch": RoomManager.SwitchDeviceView,
      "dimmer": RoomManager.DimmerDeviceView,
      "thermostat": RoomManager.ThermostatDeviceView,
      "shutter": RoomManager.ShutterDeviceView
    },

    initialize: function(){
      this.collection = this.model.devices;

      var type = this.model.get("type");
      this.itemView = this.itemViewTypes[type];
    },

    addDeviceClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("room:device:addToGroup", RoomManager.currentRoom, this.model);
    },

    appendHtml: function(cv, iv){
      cv.$("ul").append(iv.el);
    }
  });

  RoomManager.DeviceGroupList = Backbone.Marionette.CollectionView.extend({
    className: "span12",
    itemView: RoomManager.DeviceGroupView
  });

  RoomManager.AddRoomForm = Backbone.Marionette.ItemView.extend({
    template: "#room-add-template",

    formFields: ["name"],

    events: {
      "click .save": "saveClicked",
      "click .cancel": "cancelClicked"
    },

    saveClicked: function(e){
      e.preventDefault();

      var data = Backbone.FormHelpers.getFormData(this);
      var room = new HIT.Room(data);

      this.trigger("save", room);

      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });

  // Helper Functions
  // ----------------

  var showAddRoom = function(floor){
    var form = new RoomManager.AddRoomForm({
      model: floor
    });
    HIT.modal.show(form);
    return form;
  };

  var showRoom = function(room){
    RoomManager.currentRoom = room;
    var view = new RoomManager.RoomLayout({
      model: room
    });
    HIT.main.show(view);
  };

  var showRoomDevices = function(roomLayout, room){
    var view = new RoomManager.DeviceGroupList({
      collection: room.deviceGroups
    });
    roomLayout.deviceList.show(view);
  };

  // App Event Handlers
  // ------------------

  HIT.vent.on("room:selected", showRoom);

  HIT.vent.on("room:add", function(floor){
    var form = showAddRoom(floor);
    form.on("save", function(room){
      floor.addRoom(room);
      HIT.HomeList.saveCurrentHome();
      HIT.vent.trigger("room:selected", room);
    });
  });

  return RoomManager;
})(HomeInTouch, Backbone, _, $);
