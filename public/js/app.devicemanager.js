HomeInTouch.DeviceManager = (function(HIT, Backbone, _, $){
  var DeviceManager = {};

  DeviceManager.EditForm = Backbone.Marionette.ItemView.extend({
    template: "#device-edit-template"
  });

  var showDeviceEditForm = function(device){
    var form = new DeviceManager.EditForm({
      model: device
    });
    HIT.modal.show(form);
  };

  var showAddDevice = function(deviceType){
    console.log("add device type!");
  };

  HIT.vent.on("device:selected", showDeviceEditForm);
  HIT.vent.on("room:addDevice", showAddDevice);

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
