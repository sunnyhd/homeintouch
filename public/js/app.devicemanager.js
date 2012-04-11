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

  HIT.vent.on("device:selected", showDeviceEditForm);

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
