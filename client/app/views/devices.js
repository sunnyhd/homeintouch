var Device = require('models/device');

exports.AddDeviceGroupToRoomForm = Backbone.Marionette.ItemView.extend({

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
exports.AddEditDeviceTypeForm = Backbone.Marionette.ItemView.extend({

    events: function(){
        var events = {
            "click .cancel.btn": "cancelClicked",
            "click .add.btn": "addClicked",
            "click .delete.btn": "deleteClicked"
        }
        _.extend(events, this.formEvents);
        return events;
    },

    deleteClicked: function(e){
        e.preventDefault();
        this.model.destroy();
        this.trigger("device:deleted");
        this.close();
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

exports.AddSwitchDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-switch-template",

    formFields: ["name", "read_switch", "write_switch"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_switch", data.read_switch);
        device.addAddress("write_switch",data.write_switch);

        return device;
    }

});

exports.ViewSwitchDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-switch-template"

});

exports.AddShutterDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-shutter-template",

    formFields: ["name", "read_position", "write_stop", "write_position", "write_switch"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_position", data.read_position);
        device.addAddress("write_stop", data.write_stop);
        device.addAddress("write_position", data.write_position);
        device.addAddress("write_switch", data.write_switch);

        return device;
    }

});

exports.ViewShutterDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-shutter-template"

});

exports.AddThermostatDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-thermostat-template",

    formFields: ["name", "read_mode", "write_mode", "read_temperature_set", "write_temperature_set", "read_temperature_actual"],

    buildDevice: function(data){
        var device = new Device({
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

exports.ViewThermostatDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-thermostat-template"

});

exports.AddDimmerDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-dimmer-template",

    formFields: ["name", "read_switch", "write_switch", "read_dimmer", "write_dimmer"],

    buildDevice: function(data){
        var device = new Device({
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

exports.ViewDimmerDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-dimmer-template"
    
});