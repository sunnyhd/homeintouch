var app = require('app');
var PictureItemView = require('views/pictures/picture_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_list'),
    
    itemView: PictureItemView,

    events: {
        'click .parent': 'parent'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    onRender: function() {
        if (!this.collection.directory) {
            this.$('a.parent').hide();
        }
    },

    // Event Handlers

    parent: function() {
        var parent = this.collection.parent();

        if (parent) {
            app.router.navigate('pictures/' + parent, { trigger: true });
        }
    }
    
});