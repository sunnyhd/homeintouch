var DeviceTypes = require('collections/device_types');

var deviceTypes = exports.deviceTypes = new DeviceTypes();

// Get the DeviceType object by id
exports.get = function(typeId){
    return deviceTypes.get(typeId);
};

exports.getByType = function(type){
    return deviceTypes.find(function(dg){
        return dg.get("type") === type;
    });
};

// Get the name of the device type, by id,
// or "(unknown type)" if it's not found.
exports.getName = function(typeId){
    var name;

    var type = deviceTypes.get(typeId);

    if (type){
        name = type.get("name");
    } else {
        name = "(unknown type)";
    }

    return name;
};

exports.all = function(){
    return deviceTypes;
};