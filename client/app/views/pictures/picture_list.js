var app = require('app');
var PictureItemView = require('views/pictures/picture_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_list'),
    
    itemView: PictureItemView,

    events: {
        'click [data-action="parent-directory"]': 'parent'        
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    onRender: function() {
        if (!this.collection.directory) {
            this.$('a[data-action="parent-directory"]').hide();
        } else {
            this.$('div.header h3').html('Pictures of ' + this.collection.directory);
        }
    },

    // Event Handlers

    parent: function() {
        var parent = this.collection.parent();

        if (parent) {
            app.router.navigate('#pictures/list-view/' + parent, { trigger: true });
        }
    }
    
});