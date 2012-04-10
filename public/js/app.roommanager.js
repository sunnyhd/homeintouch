HomeInTouch.RoomManager = (function(HIT, Backbone, _, $){
  var RoomManager = {};

  // Views
  // -----

  RoomManager.RoomLayout = Backbone.Marionette.Layout.extend({
    template: "#room-layout-template",

    regions: {
      deviceList: ".room-devices"
    },

    onRender: function(){
      showRoomDevices(this, this.model);
    }
  });

  RoomManager.DeviceView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#device-list-item-template"
  });

  RoomManager.DeviceList = Backbone.Marionette.CompositeView.extend({
    template: "#device-list-template",
    className: "room-device span3",

    itemView: RoomManager.DeviceView,

    initialize: function(){
      this.collection = this.model.devices;
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
    var deviceTypeGroups = room.devices.byType();
    var deviceTypeCollection = new Backbone.Collection();

    _.each(deviceTypeGroups, function(group, type){
      var typeName = getTypeName(type);
      var deviceType = new Backbone.Model({name: typeName});
      deviceType.devices = new Backbone.Collection(group);
      deviceTypeCollection.add(deviceType);
    });

    var view = new RoomManager.DeviceTypeList({
      collection: deviceTypeCollection
    });
    roomLayout.deviceList.show(view);
  };

  // This needs to be replaced with some real data from
  // the server, to tell us about the type of device we
  // are dealing with. Hard coded list for now.
  var getTypeName = function(index){
    return ["Light"][index];
  }

  // App Event Handlers
  // ------------------

  HIT.vent.on("room:selected", showRoom);

  return RoomManager;
})(HomeInTouch, Backbone, _, $);
