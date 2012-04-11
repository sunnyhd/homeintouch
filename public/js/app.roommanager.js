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
      HIT.vent.trigger("room:addDeviceType");
    },

    onRender: function(){
      showRoomDevices(this, this.model);
    }
  });

  RoomManager.DeviceView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#device-list-item-template",

    events: {
      "click a": "deviceClicked"
    },

    deviceClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("device:selected", this.model);
    }
  });

  RoomManager.DeviceList = Backbone.Marionette.CompositeView.extend({
    template: "#device-list-template",
    className: "room-device span3",

    itemView: RoomManager.DeviceView,

    events: {
      "click button.addDevice": "addDeviceClicked"
    },

    initialize: function(){
      this.collection = this.model.devices;
    },

    addDeviceClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("room:addDevice");
    },

    appendHtml: function(cv, iv){
      cv.$("ul").append(iv.el);
    }
  });

  RoomManager.DeviceTypeList = Backbone.Marionette.CollectionView.extend({
    className: "row",
    itemView: RoomManager.DeviceList
  });

  // Helper Functions
  // ----------------

  var showRoom = function(room){
    var view = new RoomManager.RoomLayout({
      model: room
    });

    HIT.main.show(view);
  };

  var showRoomDevices = function(roomLayout, room){
    var deviceTypeCollection = room.devices.byType();
    var view = new RoomManager.DeviceTypeList({
      collection: deviceTypeCollection
    });
    roomLayout.deviceList.show(view);
  };

  // App Event Handlers
  // ------------------

  HIT.vent.on("room:selected", showRoom);

  return RoomManager;
})(HomeInTouch, Backbone, _, $);
