HomeInTouch.DeviceManager = (function(HIT, Backbone, _, $){
  var DeviceManager = {};

  // Views
  // -----

  DeviceManager.EditDeviceForm = Backbone.Marionette.ItemView.extend({
    template: "#device-edit-template"
  });

  DeviceManager.AddDeviceGroupForm = Backbone.Marionette.ItemView.extend({
    template: "#device-group-add-template"
  });

  DeviceManager.AddDeviceToGroupForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-to-group-template"
  });

  // Helper Methods
  // --------------

  var showDeviceEditForm = function(device){
    var form = new DeviceManager.EditDeviceForm({
      model: device
    });
    HIT.modal.show(form);
  };

  var showAddDevice = function(deviceType){
    var form = new DeviceManager.AddDeviceToGroupForm({
      model: deviceType
    });
    HIT.modal.show(form);
  };

  var showAddDeviceGroup = function(room){
    var form = new DeviceManager.AddDeviceGroupForm({
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
