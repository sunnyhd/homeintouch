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
      var typeId = this.$("select").val();

      this.result = {
        status: "OK",
        deviceTypeId: typeId
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
  // `AddDeviceTypeZeroForm` for an example
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
      var device = new HIT.Device(data);

      this.save && this.save();

      this.result = {
        status: "OK",
        device: device
      }

      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();

      this.save && this.save();

      this.result = {
        status: "CANCEL"
      }

      this.close();
    }
  });

  DeviceManager.AddDeviceTypeZeroForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-type-zero-template",
    formFields: ["name", "read_address", "write_address"]
  });

  DeviceManager.EditDeviceTypeZeroForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-edit-type-zero-template",
    formFields: ["name", "read_address", "write_address"],

    formEvents: {
      "click .switch .btn.on": "switchOnClicked",
      "click .switch .btn.off": "switchOffClicked"
    },

    initialize: function(){
      this.writeAddress = this.model.get("write_address");
      this.readAddress = this.model.get("read_address");
      this.readSwitch();
    },

    switchOnClicked: function(){
      this.model.set({state: 1});
      this.flipSwitch(1);
    },

    switchOffClicked: function(){
      this.model.set({state: 0});
      this.flipSwitch(0);
    },

    flipSwitch: function(on){
      HIT.vent.trigger("device:write", this.writeAddress, on);
    },

    selectSwitch: function(){
      var state = this.model.get("state");
      var $btnSwitch;
      if (state){
        $btnSwitch = this.$(".switch .btn.on");
      } else {
        $btnSwitch = this.$(".switch .btn.off");
      }
      $btnSwitch.button("toggle");
    },

    readSwitch: function(){
      HIT.vent.trigger("device:read", this.readAddress);
    },

    onRender: function(){
      this.selectSwitch();
    }
  });

  DeviceManager.AddDeviceTypeOneForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-type-one-template",
    formFields: ["name", "read_state_address", "write_state_address", "read_value_address", "write_value_address"]
  });

  DeviceManager.EditDeviceTypeOneForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-edit-type-one-template",
    formFields: ["name", "read_state_address", "write_state_address", "read_value_address", "write_value_address"]
  });

  // Helper Methods
  // --------------

  var deviceTypeAddForm = {
    "dt0": DeviceManager.AddDeviceTypeZeroForm,
    "dt1": DeviceManager.AddDeviceTypeOneForm
  };

  var deviceTypeEditForm = {
    "dt0": DeviceManager.EditDeviceTypeZeroForm,
    "dt1": DeviceManager.EditDeviceTypeOneForm
  };

  var showDeviceEditForm = function(device){
    var deviceTypeId = device.get("type");
    var FormType = deviceTypeEditForm[deviceTypeId];
    var form = new FormType({
      model: device
    });
    HIT.modal.show(form);
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
        var deviceTypeId = result.deviceTypeId;
        var deviceGroup = room.findOrCreateGroup(deviceTypeId);
        okCallback(deviceGroup);
      }
    },

    addDeviceFormClosed: function(result, room, deviceGroup){
      if (result.status === "OK"){
        deviceGroup.devices.add(result.device);
        room.deviceGroups.add(deviceGroup);
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
      console.log(deviceGroup);
      var deviceType = deviceGroup.deviceType;
      var FormType = deviceTypeAddForm[deviceType.id];

      var form = new FormType({
        model: deviceType
      });
      HIT.modal.show(form);

      return form;
    }
  };

  // Application Event handlers
  // --------------------------

  HIT.vent.on("device:selected", showDeviceEditForm);

  HIT.vent.on("room:device:addToGroup", function(room, deviceGroup){
    addDeviceWorkflows.addDeviceToGroup(room, deviceGroup);
  });

  HIT.vent.on("room:addDeviceGroup", function(room){
    addDeviceWorkflows.addGroupToRoom(room);
  });

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
