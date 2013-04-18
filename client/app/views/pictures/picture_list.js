var app = require('app');
var PictureItemView = require('views/pictures/picture_item');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_list'),
    
    itemView: PictureItemView,

    events: {
        'click [data-redirect]' : 'navigateFolder'
    },
    
    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    },

    onRender: function() {
        this.buildBreadcrumb();
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

    // Event Handlers

    navigateFolder: function(event) {
        var $btn = $(event.currentTarget);
        var path = $btn.data('redirect');

        app.router.navigate('#pictures/cover-view/' + path, { trigger: true });
    }
    
});