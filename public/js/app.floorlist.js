HomeInTouch.FloorList = (function(HIT, Backbone, _, $){
  var FloorList = {};

  // Views
  // -----

  var RoomItemView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#room-item-template"
  });

  var FloorItemView = Backbone.Marionette.CompositeView.extend({
    tagName: "ul",
    className: "nav",
    template: "#floor-item-template",
    itemView: RoomItemView,

    initialize: function(){
      this.collection = this.model.rooms;
    },

    appendHtml: function(cv, iv){
      cv.$("ul.dropdown-menu").append(iv.el);
    }
  });

  var FloorSelectorListView = Backbone.Marionette.CollectionView.extend({
    className: "nav-collapse",
    itemView: FloorItemView
  });
  
  // Application Event Handlers
  // --------------------------

  HIT.vent.on("home:selected", function(home) {
    showFloorList(home.floors);
    var floor = home.floors.at(0);
    if (floor){
      var room = floor.rooms.at(0);
      if (room){
        HIT.vent.trigger("room:selected", room);
      }
    }
  }, this)

  // Helper Methods
  // --------------

  var showFloorList = function(floors){
    var view = new FloorSelectorListView({
      collection: floors
    });

    HIT.floorList.show(view);
  };

  return FloorList;
})(HomeInTouch, Backbone, _, $);
