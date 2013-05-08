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
        'click [data-action="play-slideshow"]': 'playSlideshow',
        'click [data-action="watch-slideshow"]': 'watchSlideshow',
        'click [data-redirect]' : 'navigateFolder'
    },

    onRender: function() {
        this.buildBreadcrumb();
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    matchers: function(picture) {
        return picture.get('label');
    },

    buildBreadcrumb: function() {

        var breadcrumbList = this.options.breadcrumb;
        var $breadcrumb = this.$('.header ul.breadcrumb');

        var breadcrumbItem;

        for (var i = 0; i < (breadcrumbList.length - 1); i++) {
            breadcrumbItem = breadcrumbList[i];
            
            $breadcrumb.append('<li><a href="#" data-redirect="' + breadcrumbItem.path + '">' + breadcrumbItem.label + '</a> <span class="divider">/</span></li>');
        }

        breadcrumbItem = breadcrumbList[breadcrumbList.length - 1];

        $breadcrumb.append('<li class="active">' + breadcrumbItem.label + '</li>');
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
    },

    // Event Handlers

    navigateFolder: function(event) {
        var $btn = $(event.currentTarget);
        var path = $btn.data('redirect');

        app.router.navigate('#pictures/cover-view/' + path, { trigger: true });
    }
    
});