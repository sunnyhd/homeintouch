var Device = require('models/device');
var Configuration = require('models/configuration');

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
        };

        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();

        this.result = {
            status: "CANCEL"
        };

        this.close();
    }

});

exports.EditDeviceGroupOfRoomForm = Backbone.Marionette.ItemView.extend({

    template: "#edit-group-of-room-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    serializeData: function(){

        var data = Backbone.Marionette.ItemView.prototype.serializeData.apply(this);

        data.titleFields = this.model.get("titleFields");
        data.bodyFields = this.model.get("bodyFields");

        this.addStyleValues(data.titleFields, this.model.get("titleConfiguration"));
        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));

        return data;
    },

    addStyleValues: function(fields, configuration){
        _.each(fields, function(field) {
            if (configuration != null) {
                field.value = configuration.getStyleAttribute(field.id);
            } else {
                field.value = '';
            }
        });
    },

    extractStyle: function(formData, prefix, selector){

        var styleKeys = _.keys(formData);
        var styleNames = _.filter(styleKeys, function(styleName) {
            return styleName.indexOf(prefix) == 0;
        }, this);

        var styleData = _.pick(formData, styleNames);
        var newStyleData = {};
        _.each(styleData, function(value, key){
            if (value != null && value != '') {
                newStyleData[key.substr(prefix.length)] = value;
            }
        }, this);

        newStyleData['selector'] = selector;
        newStyleData['prefix'] = prefix;

        return newStyleData;
    },

    updateStyleConfiguration: function(formData, prefix, selector, attributeName) {

        var configurationAttributes = this.extractStyle(formData, prefix, selector);

        var configuration = this.model.get(attributeName);

        if (configuration == null) {
            configuration = new Configuration();
            this.model.set(attributeName, configuration);
        }

        configuration.resetAttributes();

        configuration.set(configurationAttributes);
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = _.union(_.pluck(this.model.get("titleFields"), 'id'), _.pluck(this.model.get("bodyFields"), 'id'));

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        this.updateStyleConfiguration(data, this.model.titlePrefix, this.model.titleSelector, "titleConfiguration");
        this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");

        this.result = {
            status: "OK"
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

        device.addAddress("read_switch", data.read_switch, '1.001');
        device.addAddress("write_switch", data.write_switch, '1.001');

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

        device.addAddress("read_position", data.read_position, '5.001');
        device.addAddress("write_stop", data.write_stop, '1.001');
        device.addAddress("write_position", data.write_position, '5.001');
        device.addAddress("write_switch", data.write_switch, '1.008');

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

        device.addAddress("read_mode", data.read_mode, '20.102');
        device.addAddress("write_mode", data.write_mode, '20.102');
        device.addAddress("read_temperature_set", data.read_temperature_set, '9.001');
        device.addAddress("write_temperature_set", data.write_temperature_set, '9.001');
        device.addAddress("read_temperature_actual", data.read_temperature_actual, '9.001');

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

        device.addAddress("read_switch", data.read_switch, '1.001');
        device.addAddress("write_switch",data.write_switch, '1.001');
        device.addAddress("read_dimmer", data.read_dimmer, '5.001');
        device.addAddress("write_dimmer",data.write_dimmer, '5.001');

        return device;
    }

});

exports.ViewDimmerDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-dimmer-template"
    
});

exports.AddDoorDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-door-template",

    formFields: ["name", "read_door"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_door", data.read_door, '1.009');
        return device;
    }
});

exports.ViewDoorDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-door-template"
});

exports.AddWindowDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-window-template",

    formFields: ["name", "read_window"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_window", data.read_window, '1.009');
        return device;
    }
});

exports.ViewWindowDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-window-template"
});

exports.AddSocketDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-socket-template",

    formFields: ["name", "read_socket", "write_socket"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_socket", data.read_socket, '1.001');
        device.addAddress("write_socket",data.write_socket, '1.001');

        return device;
    }

});

exports.ViewSocketDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-socket-template"
});

exports.AddCameraDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-camera-template",

    formEvents: {
        'change #cameraType': 'cameraTypeChanged'
    },

    formFields: ["name", "cameraType", "url", "refresh", "autoPlay", "cmd_opt1_btn_name", "cmd_opt1_cmd", "cmd_opt1_read_address", 
    "cmd_opt2_btn_name", "cmd_opt2_cmd", "cmd_opt2_read_address", "cmd_opt3_btn_name", "cmd_opt3_cmd", 
    "cmd_opt3_read_address"],

    buildDevice: function(data) {
        var device = new Device({
            name: data.name,
            cameraType: data.cameraType,
            url: data.url,
            refresh: data.refresh,
            autoPlay: data.autoPlay,
            type: data.type,
            cmd_opt1_btn_name: data["cmd_opt1_btn_name"], 
            cmd_opt1_cmd: data["cmd_opt1_cmd"], 
            cmd_opt1_read_address: data["cmd_opt1_read_address"], 
            cmd_opt2_btn_name: data["cmd_opt2_btn_name"], 
            cmd_opt2_cmd: data["cmd_opt2_cmd"], 
            cmd_opt2_read_address: data["cmd_opt2_read_address"], 
            cmd_opt3_btn_name: data["cmd_opt3_btn_name"], 
            cmd_opt3_cmd: data["cmd_opt3_cmd"], 
            cmd_opt3_read_address: data["cmd_opt3_read_address"]
        });

        device.addAddress("cmd_opt1_read_address",data.cmd_opt1_read_address);
        device.addAddress("cmd_opt2_read_address",data.cmd_opt2_read_address);
        device.addAddress("cmd_opt3_read_address",data.cmd_opt3_read_address);

        return device;
    },

    cameraTypeChanged: function(e) {
        var value = $('#cameraType', this.$el).val();

        if (value === 'video') {
            $('#refreshGroup', this.$el).hide();
            $('#autoPlayGroup', this.$el).show();

        } else if (value === 'img') {
            $('#autoPlayGroup', this.$el).hide();
            $('#refreshGroup', this.$el).show();
        }
    },

    onRender: function() {
        this.cameraTypeChanged();
        $('*[rel="tooltip"]', this.$el).tooltip();
    }

});

exports.ViewCameraDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-camera-template"
});

exports.AddScenesDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-scenes-template",

    formFields: ["name", "write_scenes", "icon"],

    serializeData: function(){
        var data = Backbone.Marionette.CompositeView.prototype.serializeData.apply(this, arguments);

        data.icons = icons.devices.scenes;

        return data;
    },

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type,
            scenesIcon: data.icon
        });

        device.addAddress("write_scenes",data.write_scenes, '1.001');

        return device;
    }

});

exports.ViewScenesDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-scenes-template"
});

exports.AddMotionDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-motion-template",

    formFields: ["name", "read_motion"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_motion", data.read_motion, '1.011');

        return device;
    }

});

exports.ViewMotionDeviceForm = exports.AddEditDeviceTypeForm.extend({
    template: "#device-view-motion-template"
});

exports.AddRgbDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-add-rgb-template",

    formFields: ["name", "read_red_color", "write_red_color", "read_green_color", "write_green_color",
                "read_blue_color", "write_blue_color", "read_brightness", "write_brightness"],

    buildDevice: function(data){
        var device = new Device({
            name: data.name,
            type: data.type
        });

        device.addAddress("read_red_color", data.read_red_color);
        device.addAddress("write_red_color", data.write_red_color);

        device.addAddress("read_green_color", data.read_green_color);
        device.addAddress("write_green_color", data.write_green_color);

        device.addAddress("read_blue_color", data.read_blue_color);
        device.addAddress("write_blue_color", data.write_blue_color);

        device.addAddress("read_brightness", data.read_brightness);
        device.addAddress("write_brightness", data.write_brightness);

        return device;
    }

});

exports.ViewRgbDeviceForm = exports.AddEditDeviceTypeForm.extend({

    template: "#device-view-rgb-template"

});