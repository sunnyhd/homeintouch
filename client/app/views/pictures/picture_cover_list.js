var app = require('app');
var PictureItemCoverView = require('views/pictures/picture_cover_item');
var PictureBreadcrumbView = require('views/pictures/picture_breadcrumb');
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
        'click [data-action="play-slideshow"]': 'playSlideshow',
        'click [data-action="watch-slideshow"]': 'watchSlideshow'
    },

    onRender: function() {
        this.breadcrumb = new PictureBreadcrumbView( {el: 'ul.breadcrumb'} );
        this.breadcrumb.on('breadcrumb:navigate', this.navigate, this); 
        this.breadcrumb.build(this.options.breadcrumb);
    },

    navigate: function(path) {
        app.router.navigate('#pictures/cover-view/' + path, { trigger: true });
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    playSlideshow: function() {
        this.collection.play();
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
    }
    
});