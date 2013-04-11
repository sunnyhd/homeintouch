var app = require('app');
var PictureItemCoverView = require('views/pictures/picture_cover_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_cover_list'),
    
    itemView: PictureItemCoverView,

    events: {
		'click .pictures-header-option button': 'listViewClicked'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    matchers: function(picture) {
        return picture.get('label');
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    }
    
});