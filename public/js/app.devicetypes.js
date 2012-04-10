HomeInTouch.DeviceTypes = (function(HIT, Backbone, _, $){
  var DeviceTypes = {};
  var deviceTypeCollection = new HIT.DeviceTypeCollection();

  DeviceTypes.get = function(typeId){
    return deviceTypeCollection.get(typeId);
  };

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

  HIT.vent.on("deviceTypes", function(data){
    deviceTypeCollection.reset(data);
  });

  return DeviceTypes;
})(HomeInTouch, Backbone, _, $);
