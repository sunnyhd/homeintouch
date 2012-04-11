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

  DeviceManager.AddDeviceTypeZeroForm = Backbone.Marionette.ItemView.extend({
    template: "#device-add-type-zero-template",

    events: {
      "click .cancel.btn": "cancelClicked",
      "click .add.btn": "addClicked"
    },

    formFields: ["name", "read_address", "write_address"],

    addClicked: function(e){
      e.preventDefault();

      var data = Backbone.FormHelpers.getFormData(this);
      var device = new HIT.Device(data);

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

  // Workflow Objects
  // ----------------

  var addDeviceGroupWorkflow = {
    run: function(room){
      var that = this;
      var viewModel = this.getAddGroupViewModel(room);

      // add group to room
      var addGroupForm = this.showAddGroupForm(viewModel);
      addGroupForm.on("close", function(){
        that.addGroupClose(addGroupForm.result, room, function(deviceGroup){
          
          // add device to group
          var addDeviceForm = that.showAddDeviceToGroup(deviceGroup);
          addDeviceForm.on("close", function(){
            that.addDeviceFormClosed(addDeviceForm.result, room, deviceGroup);
          });

        });

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
        var deviceTypeId = parseInt(result.deviceTypeId, 10);
        var deviceType = HIT.DeviceTypes.get(deviceTypeId);

        var deviceGroup = room.deviceGroups.find(function(dg){ 
          return dg.deviceType.id === deviceTypeId; 
        });

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
      var deviceType = deviceGroup.deviceType;
      var FormType = deviceTypeAddEditForm[deviceType.id];

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

  HIT.vent.on("room:device:addToGroup", function(deviceGroup){
    addDeviceGroupWorkflow.showAddDeviceToGroup(deviceGroup);
  });

  HIT.vent.on("room:addDeviceGroup", function(room){
    addDeviceGroupWorkflow.run(room);
  });

  return DeviceManager;
})(HomeInTouch, Backbone, _, $);
