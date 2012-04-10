HomeInTouch.RoomManager = (function(HIT, Backbone, _, $){
  var RoomManager = {};

  RoomManager.RoomView = Backbone.Marionette.Layout.extend({
    template: "#room-layout-template"
  });

  var showRoom = function(room){
    var view = new RoomManager.RoomView({
      model: room
    });
    HIT.main.show(view);
  };

  HIT.vent.on("room:selected", showRoom);

  return RoomManager;
})(HomeInTouch, Backbone, _, $);
