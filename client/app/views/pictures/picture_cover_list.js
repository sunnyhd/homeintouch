var app = require('app');
var PictureItemCoverView = require('views/pictures/picture_cover_item');
var FilteredListView = require('views/filtered_list');
var Files = require('collections/files');
var Playable = require('models/playable');
var PictureDetailView = require('views/pictures/picture_detail');
var PictureSlideshowView = require('views/pictures/picture_slideshow');
    
module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_cover_list'),
    
    itemView: PictureItemCoverView,

    events: {
		'click .pictures-header-option button': 'listViewClicked',
        'click [data-action="parent-directory"]': 'parent',
        'click [data-action="play-slideshow"]': 'playSlideshow',
        'click [data-action="watch-slideshow"]': 'watchSlideshow'
    },

    onRender: function() {
        if (!this.collection.directory) {
            this.$('a[data-action="parent-directory"], div#folder-actions').hide();
        } else {
            this.$('div.header h3').html('Pictures of ' + this.collection.directory);
        }
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    matchers: function(picture) {
        return picture.get('label');
    },

    playSlideshow: function() {
        var playable = new Playable({ item: { path: this.collection.directory }});
        playable.save();

        this.$('.dropdown-toggle').parent().removeClass('open');

        return false;
    },

    watchSlideshow: function() {

        app.router.navigate('#pictures/cover-view/slideshow/' + this.collection.directory, { trigger: true });

        return false;
    },

    listViewClicked: function(e) {
    	var $btn = $(e.currentTarget);
    	app.router.navigate($btn.attr('href'), {trigger: true});
    },

    // Event Handlers

    parent: function() {
        var parent = this.collection.parent();

        if (parent) {
            app.router.navigate('#pictures/cover-view/' + parent, { trigger: true });
        }
    }
    
});