HomeInTouch.DeviceTypes = (function(HIT, Backbone, _, $){
  var DeviceTypes = {};
  var deviceTypeCollection = new HIT.DeviceTypeCollection();

  // Public API for device types
  // ---------------------------

  // Get the DeviceType object by id
  DeviceTypes.get = function(typeId){
    return deviceTypeCollection.get(typeId);
  };

  DeviceTypes.getByType = function(type){
    return deviceTypeCollection.find(function(dg){
      return dg.get("type") === type;
    });
  };

  // Get the name of the device type, by id,
  // or "(unknown type)" if it's not found.
  DeviceTypes.getName = function(typeId){
    var name;

    var type = deviceTypeCollection.get(typeId);
    if (type){
      name = type.get("name");
    } else {
      name = "(unknown type)";
    }

    return name;
  };

  DeviceTypes.all = function(){
    return deviceTypeCollection;
  }

  // Initializer
  // -----------
  
  HIT.addInitializer(function(options) {
    deviceTypeCollection.reset(options.deviceTypes);
  });

  return DeviceTypes;
})(HomeInTouch, Backbone, _, $);
