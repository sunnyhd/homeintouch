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
      data.type = this.model.id;

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

  DeviceManager.AddDeviceTypeZeroForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-add-type-zero-template",
    formFields: ["name", "read_address", "write_address"],

    buildDevice: function(data){
      var device = new HIT.Device({
        name: data.name,
        type: data.type
      });

      var read = new HIT.Address({
        type: "read_address",
        address: data.read_address,
        name: "read",
        value: ""
      });
      device.addresses.add(read);

      var write = new HIT.Address({
        type: "write_address",
        address: data.write_address,
        name: "write",
        value: ""
      });
      device.addresses.add(write);

      return device;
    }
  });

  DeviceManager.ViewDeviceTypeZeroForm = DeviceManager.AddEditDeviceTypeForm.extend({
    template: "#device-view-type-zero-template",

    formEvents: {
      "click .switch .btn.on": "switchOnClicked",
      "click .switch .btn.off": "switchOffClicked"
    },

    initialize: function(){
      this.bindTo(this.model, "change:address:value", this.selectSwitch, this);
      this.readAddress = this.model.addresses.find(function(address){
        return address.get("type") === "read_address";
      });
      this.writeAddress = this.model.addresses.find(function(address){
        return address.get("type") === "write_address";
      });
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

  // Helper Methods
  // --------------

  var deviceTypeAddForm = {
    0: DeviceManager.AddDeviceTypeZeroForm,
  };

  var deviceTypeEditForm = {
    0: DeviceManager.ViewDeviceTypeZeroForm,
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
