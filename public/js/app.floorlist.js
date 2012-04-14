HomeInTouch.FloorList = (function(HIT, Backbone, _, $){
  var FloorList = new Backbone.Marionette.EventAggregator();

  // Views
  // -----

  var RoomItemView = Backbone.Marionette.ItemView.extend({
    tagName: "li",
    template: "#room-item-template",

    events: {
      "click a": "roomClicked"
    },

    roomClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("room:selected", this.model);
    }
  });

  var FloorItemView = Backbone.Marionette.CompositeView.extend({
    tagName: "ul",
    className: "nav",
    template: "#floor-item-template",
    itemView: RoomItemView,

    events: {
      "click .add-room": "addRoomClicked"
    },

    initialize: function(){
      this.collection = this.model.rooms;
    },

    addRoomClicked: function(e){
      e.preventDefault();
      HIT.vent.trigger("room:add", this.model);
    },

    appendHtml: function(cv, iv){
      var $splitter = cv.$("ul.dropdown-menu li.divider");
      $splitter.before(iv.el);
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
    },

    appendHtml: function(cv, iv){
      var $addNew = cv.$(".add-new");
      $addNew.before(iv.el);
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
    showFirstRoom(home);
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
  
  var showFirstRoom = function(home){
    var floor = home.floors.at(0);
    var clear = true;

    if (floor){
      var room = floor.rooms.at(0);
      if (room){
        HIT.vent.trigger("room:selected", room);
        clear = false;
      }
    }

    // clear the main display area if no floor / room
    // was found for display in the selected home
    if (clear){
      var view = new Backbone.Marionette.ItemView({
        template: "#no-floors-template"
      });
      HIT.main.show(view);
    }

  };

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
