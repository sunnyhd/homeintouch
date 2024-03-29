var app = require('app');
var deviceTypesController = require('controllers/device_types');
var homesController = require('controllers/homes');
var roomsController = require('controllers/rooms');
var deviceViews = require('views/devices');

// View -> Device Type Registrations
// ---------------------------------

var deviceTypeAddForm = {
    "switch": deviceViews.AddSwitchDeviceForm,
    "dimmer": deviceViews.AddDimmerDeviceForm,
    "thermostat": deviceViews.AddThermostatDeviceForm,
    "shutter": deviceViews.AddShutterDeviceForm,
    "door": deviceViews.AddDoorDeviceForm,
    "window": deviceViews.AddWindowDeviceForm,
    "socket": deviceViews.AddSocketDeviceForm,
    "camera": deviceViews.AddCameraDeviceForm,
    "scenes": deviceViews.AddScenesDeviceForm,
    "motion": deviceViews.AddMotionDeviceForm,
    "rgb": deviceViews.AddRgbDeviceForm
};

var deviceTypeViewForm = {
    "switch": deviceViews.ViewSwitchDeviceForm,
    "dimmer": deviceViews.ViewDimmerDeviceForm,
    "thermostat": deviceViews.ViewThermostatDeviceForm,
    "shutter": deviceViews.ViewShutterDeviceForm,
    "door": deviceViews.ViewDoorDeviceForm,
    "window": deviceViews.ViewWindowDeviceForm,
    "socket": deviceViews.ViewSocketDeviceForm,
    "camera": deviceViews.ViewCameraDeviceForm,
    "scenes": deviceViews.ViewScenesDeviceForm,
    "motion": deviceViews.ViewMotionDeviceForm,
    "rgb": deviceViews.ViewRgbDeviceForm
};

// Helper Methods
// --------------

var showDeviceViewForm = function(device){
    var deviceType = device.get("type");
    var FormType = deviceTypeViewForm[deviceType];

    var form = new FormType({ model: device, mode: "view" });
    app.modal.show(form);

    return form;
};

var showDeviceEditForm = function(device){
    var deviceType = device.get("type");
    var FormType = deviceTypeAddForm[deviceType];

    var form = new FormType({ model: device, mode: "edit" });
    app.modal.show(form);

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

    editGroupOfRoom: function(deviceGroup){
        var that = this;
        var viewModel = deviceGroup.model;

        var editGroupForm = this.showEditGroupForm(viewModel);

        editGroupForm.on("close", function(){
            if (editGroupForm.result.status === "OK"){
                homesController.saveCurrentHome();
                deviceGroup.applyStyles();
            }
        });
    },

    addDeviceToGroup: function(room, deviceGroup){
        var that = this;

        var addDeviceForm = this.showAddDeviceToGroup(deviceGroup);

        addDeviceForm.on("close", function(){
            that.addDeviceFormClosed(addDeviceForm.result, room, deviceGroup);
        });
    },

    editDevice: function(device){
        var that = this;

        var editDeviceForm = showDeviceEditForm(device);

        editDeviceForm.on("close", function(){
            that.editDeviceFormClosed(editDeviceForm.result);
        });
    },

    getAddGroupViewModel: function(room){
        // create a view model with all our data
        var roomData = room.toJSON();
        roomData.deviceTypes = deviceTypesController.all().toJSON();
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
            homesController.saveCurrentHome();

            if (room.deviceGroups.length === 1) {
                room.collection.select(room);
            }
        }
    },

    editDeviceFormClosed: function(result){
        if (result.status === "OK"){
            homesController.saveCurrentHome();
            roomsController.showCurrent();
        }
    },

    showAddGroupForm: function(viewModel){
        // the add form
        var form = new deviceViews.AddDeviceGroupToRoomForm({
            model: viewModel
        });

        // Show the add group form
        app.modal.show(form);

        return form;
    },

    showEditGroupForm: function(viewModel){
        // the add form
        var form = new deviceViews.EditDeviceGroupOfRoomForm({
            model: viewModel
        });

        // Show the add group form
        app.modal.show(form);

        return form;
    },

    showAddDeviceToGroup: function(deviceGroup){
        var deviceType = deviceGroup.deviceType;
        var FormType = deviceTypeAddForm[deviceType.get("type")];

        var form = new FormType({
            model: deviceType
        });
        app.modal.show(form);

        return form;
    }
};

exports.selectDevice = function(device) {
    var form = showDeviceViewForm(device);

    form.on('device:deleted', function() {
        homesController.saveCurrentHome();
    });
};

exports.addDeviceToGroup = function(room, deviceGroup) {
    addDeviceWorkflows.addDeviceToGroup(room, deviceGroup);
};

exports.addGroupToRoom = function(room) {
    addDeviceWorkflows.addGroupToRoom(room);
};

exports.editGroupOfRoom = function(deviceGroup) {
    addDeviceWorkflows.editGroupOfRoom(deviceGroup);
};

// Application Event handlers
// --------------------------

app.vent.on("device:selected", function(device){
    var form = showDeviceViewForm(device);
    form.on("device:deleted", function(){
        homesController.saveCurrentHome();
    });

    form.on("close", function(){
        if (form.result.status === "EDIT") {
            addDeviceWorkflows.editDevice(form.result.device);
        }
    });
});

app.vent.on("room:device:addToGroup", function(room, deviceGroup){
    addDeviceWorkflows.addDeviceToGroup(room, deviceGroup);
});

app.vent.on("room:addDeviceGroup", function(room){
    addDeviceWorkflows.addGroupToRoom(room);
});

app.vent.on("room:editDeviceGroup", function(deviceGroup){
    addDeviceWorkflows.editGroupOfRoom(deviceGroup);
});