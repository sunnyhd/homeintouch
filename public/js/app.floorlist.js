HomeInTouch.FloorList = (function(HIT, Backbone, _, $){
  var FloorList = new Backbone.Marionette.EventAggregator();

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

  var FloorSelectorListView = Backbone.Marionette.CompositeView.extend({
    className: "nav-collapse",
    template: "#floor-list-template",
    itemView: FloorItemView,

    events: {
      "click .add-floor": "addFloorClicked"
    },

    addFloorClicked: function(e){
      e.preventDefault();
      FloorList.trigger("floor:add");
    }
  });

  var AddFloorForm = Backbone.Marionette.ItemView.extend({
    template: "#floor-add-template",

    formFields: ["name", "rooms"],

    events: {
      "click .save": "saveClicked",
      "click .cancel": "cancelClicked"
    },

    saveClicked: function(e){
      e.preventDefault();

      var data = Backbone.FormHelpers.getFormData(this);
      var roomNames = data.rooms.split(","); delete data.rooms;
      
      var rooms = [];
      
      for(var i = 0, length = roomNames.length; i<length; i++){
        var roomName = $.trim(roomNames[i]);
        var room = {
          name: roomName
        };
        rooms.push(room);
      }

      var floor = new HIT.Floor({
        name: data.name,
        rooms: rooms
      });

      this.trigger("save", floor);

      this.close();
    },

    cancelClicked: function(e){
      e.preventDefault();
      this.close();
    }
  });
  
  // Application And Module Event Handlers
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
  }, this);

  FloorList.on("floor:add", function(){
    var home = HIT.HomeList.currentHome;
    var form = showAddFloorForm(home);
    form.on("save", function(floor){
      home.addFloor(floor);
      HIT.HomeList.save(home);
    });
  });

  // Helper Methods
  // --------------

  var showFloorList = function(floors){
    var view = new FloorSelectorListView({
      collection: floors
    });

    HIT.floorList.show(view);
  };

  var showAddFloorForm = function(home){
    var view = new AddFloorForm({
      model: home
    });
    HIT.modal.show(view);
    return view;
  }

  return FloorList;
})(HomeInTouch, Backbone, _, $);
