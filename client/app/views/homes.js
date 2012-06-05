var app = require('app');
var homesController = require('controllers/homes');
var Home = require('models/home');

exports.HomeItemView = Backbone.Marionette.ItemView.extend({

    tagName: "li",

    template: "#home-item-template",

    events: {
        "click a": "homeClicked"
    },

    homeClicked: function(e){
        e.preventDefault();
        homesController.homes.select(this.model);
    }

});

exports.HomeSelector = Backbone.Marionette.CompositeView.extend({

    tagName: "li",

    className: "dropdown",

    template: "#home-list-template",

    itemView: exports.HomeItemView,

    events: {
        "click .add-home a": "addHomeClicked"
    },

    addHomeClicked: function(e){
        e.preventDefault();
        addNewHome();
    },

    appendHtml: function(cv, iv){
        cv.$("ul.dropdown-menu").prepend(iv.el);
    }

});

exports.AddHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#add-home-template",

    events: {
        "click .add": "addClicked",
        "click .cancel": "cancelClicked"
    },

    addClicked: function(e){
        e.preventDefault();
        var name = this.$("#home-name").val();
        this.trigger("save", name);
        this.close();
    },

    cancelClicked: function(e){
        e.preventDefault();
        this.close();
    }

});

exports.ViewHomeForm = Backbone.Marionette.ItemView.extend({

    template: "#view-home-template",

    events: {
        "click .cancel": "closeClicked",
        "click .delete": "deleteClicked"
    },

    closeClicked: function(e){
        e.preventDefault();
        this.close();
    },

    deleteClicked: function(e){
        e.preventDefault();
        this.model.destroy();
        this.trigger("home:deleted", this.model);
        this.close();
    }

});

// Helper Methods
// --------------

var addNewHome = function(){
    var form = new exports.AddHomeForm();

    form.on("save", function(name){
        var home = new Home({ id: name, name: name });

        homesController.homes.add(home);
        homesController.save(home);
    });

    app.modal.show(form);
};