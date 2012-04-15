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

    initialize: function(){
      this.bindTo(this.model, "change:address:value", this.render, this);
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
      "click .switch .btn.off": "switchOffClicked",
      "click .delete.btn": "deleteClicked"
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

    deleteClicked: function(e){
      e.preventDefault();
      this.model.destroy();
      this.trigger("device:deleted");
      this.close();
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
    template: "#device-list-dimmer-item-template"
  });

  RoomManager.ThermostatDeviceView = RoomManager.DeviceView.extend({
    template: "#device-list-thermostat-item-template"
  });

  RoomManager.DeviceGroupView = Backbone.Marionette.CompositeView.extend({
    template: "#device-list-template",
    className: "room-device span4",

    events: {
      "click button.addDevice": "addDeviceClicked"
    },

    itemViewTypes: {
      "switch": RoomManager.SwitchDeviceView,
      "dimmer": RoomManager.DimmerDeviceView,
      "thermostat": RoomManager.ThermostatDeviceView,
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
    className: "row",
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
