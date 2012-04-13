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

  RoomManager.DeviceView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#device-list-item-template",

    events: {
      "click a": "deviceClicked"
    },

    initialize: function(){
      this.bindTo(this.model, "change:address:value", this.render, this);
    },

    deviceClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("device:selected", this.model);
    }
  });

  RoomManager.DeviceGroupView = Backbone.Marionette.CompositeView.extend({
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
