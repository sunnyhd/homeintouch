HomeInTouch.DeviceManager = (function(HIT, Backbone, _, $){
  var DeviceManager = {};

  // Views
  // -----

  DeviceManager.EditDeviceForm = Backbone.Marionette.ItemView.extend({
    template: "#device-edit-template"
  });

  DeviceManager.AddDeviceGroupToRoomForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-group-to-room-template",

    events: {
      "click .cancel.btn": "cancelClicked",
      "click .add.btn": "addClicked"
    },

    addClicked: function(e){
      e.preventDefault();
      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });

  DeviceManager.AddDeviceTypeZeroForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-type-zero-template",

    events: {
      "click .cancel.btn": "cancelClicked",
      "click .add.btn": "addClicked"
    },

    addClicked: function(e){
      e.preventDefault();
      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });

  DeviceManager.AddDeviceTypeOneForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-type-one-template",

    events: {
      "click .cancel.btn": "cancelClicked",
      "click .add.btn": "addClicked"
    },

    addClicked: function(e){
      e.preventDefault();
      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });

  // Helper Methods
  // --------------

  var deviceTypeAddEditForm = {
    0: DeviceManager.AddDeviceTypeZeroForm,
    1: DeviceManager.AddDeviceTypeOneForm
  };

  var showDeviceEditForm = function(device){
    var form = new DeviceManager.EditDeviceForm({
      model: device
    });
    HIT.modal.show(form);
  };

  var showAddDevice = function(deviceType){
    console.log(deviceType);
    var FormType = deviceTypeAddEditForm[deviceType.id];
    var form = new FormType({
      model: deviceType
    });
    HIT.modal.show(form);
  };

  var showAddDeviceGroup = function(room){
    var form = new DeviceManager.AddDeviceGroupToRoomForm({
      model: room
    });
    HIT.modal.show(form);
  };

  // Application Event handlers
  // --------------------------

  HIT.vent.on("device:selected", showDeviceEditForm);
  HIT.vent.on("room:deviceGroup:add", showAddDeviceGroup);
  HIT.vent.on("room:device:addToGroup", showAddDevice);

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
