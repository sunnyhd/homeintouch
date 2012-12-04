var app = require('app');
var PictureItemView = require('views/pictures/picture_item');

module.exports = Backbone.Marionette.CompositeView.extend({
    
    template: require('templates/pictures/picture_list'),
    
    itemView: PictureItemView,

    events: {
        'click .parent': 'parent'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    // Event Handlers

    parent: function() {
        var parent = this.collection.parent();

        if (parent) {
            app.router.navigate('pictures/' + parent, { trigger: true });
        }
    }
    
});