HomeInTouch.DeviceManager = (function(HIT, Backbone, _, $){
  var DeviceManager = {};

  // Views
  // -----

  DeviceManager.AddDeviceGroupToRoomForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-group-to-room-template",

    events: {
      "click .cancel.btn": "cancelClicked",
      "click .add.btn": "addClicked"
    },

    addClicked: function(e){
      e.preventDefault();
      var type = this.$("select").val();

      this.result = {
        status: "OK",
        deviceType: type
      }

      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();

      this.result = {
        status: "CANCEL"
      }

      this.close();
    }
  });

  // Base form for adding device types.
  // Don't use this directly. See the
  // `AddSwitchDeviceForm` for an example
  // of how to use this.
  DeviceManager.AddEditDeviceTypeForm = Backbone.Marionette.ItemView.extend({
    events: function(){
      var events = {
        "click .cancel.btn": "cancelClicked",
        "click .add.btn": "addClicked"
      }
      _.extend(events, this.formEvents);
      return events;
    },

    addClicked: function(e){
      e.preventDefault();

      var data = Backbone.FormHelpers.getFormData(this);
      data.type = this.model.get("type");

      var device = this.buildDevice(data);

      this.result = {
        status: "OK",
        device: device
      }

      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();

      this.result = {
        status: "CANCEL"
      }

      this.close();
    }
  });

  DeviceManager.AddSwitchDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-switch-template",
    formFields: ["name", "read_switch", "write_switch"],

    buildDevice: function(data){
      var device = new HIT.Device({
        name: data.name,
        type: data.type
      });

      device.addAddress("read_switch", data.read_switch);
      device.addAddress("write_switch",data.write_switch);

      return device;
    }
  });

  DeviceManager.ViewSwitchDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-view-switch-template",

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

  DeviceManager.AddShutterDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-shutter-template"
  });

  DeviceManager.ViewShutterDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-view-shutter-template"
  });

  DeviceManager.AddThermostatDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-thermostat-template",

    formFields: ["name", "read_mode", "write_mode", "read_temperature_set", "write_temperature_set", "read_temperature_actual"],

    buildDevice: function(data){
      var device = new HIT.Device({
        name: data.name,
        type: data.type
      });

      device.addAddress("read_mode", data.read_mode);
      device.addAddress("write_mode", data.write_mode);
      device.addAddress("read_temperature_set", data.read_temperature_set);
      device.addAddress("write_temperature_set", data.write_temperature_set);
      device.addAddress("read_temperature_actual", data.read_temperature_actual);

      return device;
    }
  });

  DeviceManager.ViewThermostatDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-view-thermostat-template",

    formEvents: {
      "click .delete.btn": "deleteClicked"
    },

    initialize: function(){
      this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
      this.readMode = this.model.getAddressByType("read_mode");
      this.writeMode = this.model.getAddressByType("write_mode");
      this.readSetPoint = this.model.getAddressByType("read_temperature_set");
      this.writeSetPoint = this.model.getAddressByType("write_temperature_set");
      this.readTemperature = this.model.getAddressByType("read_temperature_actual");
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

    onRender: function(){
      var mode = this.readMode.get("value");
      var setPoint = this.readSetPoint.get("value");
      var temperature = this.readTemperature.get("value");
      // update the view with this info ...
    }
  });

  DeviceManager.AddDimmerDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-dimmer-template",

    formFields: ["name", "read_switch", "write_switch", "read_dimmer", "write_dimmer"],

    buildDevice: function(data){
      var device = new HIT.Device({
        name: data.name,
        type: data.type
      });

      device.addAddress("read_switch", data.read_switch);
      device.addAddress("write_switch",data.write_switch);
      device.addAddress("read_dimmer", data.read_dimmer);
      device.addAddress("write_dimmer",data.write_dimmer);

      return device;
    }
  });

  DeviceManager.ViewDimmerDeviceForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-view-dimmer-template",

    formEvents: {
      "click .switch .btn.on": "switchOnClicked",
      "click .switch .btn.off": "switchOffClicked",
      "change .dimmer": "dimmerChanged",
      "click .delete.btn": "deleteClicked"
    },

    initialize: function(){
      this.readSwitch = this.model.getAddressByType("read_switch");
      this.writeSwitch = this.model.getAddressByType("write_switch");
      this.readDimmer = this.model.getAddressByType("read_dimmer");
      this.writeDimmer = this.model.getAddressByType("write_dimmer");

      // debounce the dimmer changed, so that we only write a
      // change half a second after it was last changed
      this.dimmerChanged = _.debounce(this.dimmerChanged, 500);

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

    deleteClicked: function(e){
      e.preventDefault();
      this.model.destroy();
      this.trigger("device:deleted");
      this.close();
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

  // View -> Device Type Registrations
  // ---------------------------------

  var deviceTypeAddForm = {
    "switch": DeviceManager.AddSwitchDeviceForm,
    "dimmer": DeviceManager.AddDimmerDeviceForm,
    "thermostat": DeviceManager.AddThermostatDeviceForm,
    "shutter": DeviceManager.AddShutterDeviceForm
  };

  var deviceTypeViewForm = {
    "switch": DeviceManager.ViewSwitchDeviceForm,
    "dimmer": DeviceManager.ViewDimmerDeviceForm,
    "thermostat": DeviceManager.ViewThermostatDeviceForm,
    "shutter": DeviceManager.ViewShutterDeviceForm
  };

  // Helper Methods
  // --------------

  var showDeviceViewForm = function(device){
    var deviceType = device.get("type");
    var FormType = deviceTypeViewForm[deviceType];
    var form = new FormType({
      model: device
    });
    HIT.modal.show(form);
    return form;
  };

  // Workflow Objects
  // ----------------

  var addDeviceWorkflows = {
    addGroupToRoom: function(room){
      var that = this;
      var viewModel = this.getAddGroupViewModel(room);

      var addGroupForm = this.showAddGroupForm(viewModel);
      addGroupForm.on("close", function(){
        that.addGroupClose(addGroupForm.result, room, function(deviceGroup){
          that.addDeviceToGroup(room, deviceGroup);
        });

      });
    },

    addDeviceToGroup: function(room, deviceGroup){
      var that = this;

      var addDeviceForm = this.showAddDeviceToGroup(deviceGroup);

      addDeviceForm.on("close", function(){
        that.addDeviceFormClosed(addDeviceForm.result, room, deviceGroup);
      });
    },

    getAddGroupViewModel: function(room){
      // create a view model with all our data
      var roomData = room.toJSON();
      roomData.deviceTypes = HIT.DeviceTypes.all().toJSON();
      var addDeviceGroupModel = new Backbone.Model(roomData);
      return addDeviceGroupModel;
    },

    addGroupClose: function(result, room, okCallback){
      if (result.status === "OK"){
        var deviceType = result.deviceType;
        var deviceGroup = room.findOrCreateGroup(deviceType);
        okCallback(deviceGroup);
      }
    },

    addDeviceFormClosed: function(result, room, deviceGroup){
      if (result.status === "OK"){
        deviceGroup.devices.add(result.device);
        room.deviceGroups.add(deviceGroup);
        HIT.HomeList.saveCurrentHome();
      }
    },

    showAddGroupForm: function(viewModel){
      // the add form
      var form = new DeviceManager.AddDeviceGroupToRoomForm({
        model: viewModel
      });

      // Show the add group form
      HIT.modal.show(form);

      return form;
    },

    showAddDeviceToGroup: function(deviceGroup){
      var deviceType = deviceGroup.deviceType;
      var FormType = deviceTypeAddForm[deviceType.get("type")];

      var form = new FormType({
        model: deviceType
      });
      HIT.modal.show(form);

      return form;
    }
  };

  // Application Event handlers
  // --------------------------

  HIT.vent.on("device:selected", function(device){
    var form = showDeviceViewForm(device);
    form.on("device:deleted", function(){
      HIT.HomeList.saveCurrentHome();
    });
  });

  HIT.vent.on("room:device:addToGroup", function(room, deviceGroup){
    addDeviceWorkflows.addDeviceToGroup(room, deviceGroup);
  });

  HIT.vent.on("room:addDeviceGroup", function(room){
    addDeviceWorkflows.addGroupToRoom(room);
  });

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
