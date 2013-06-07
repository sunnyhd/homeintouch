var app = require('app');
var PictureItemView = require('views/pictures/picture_item');
var PictureBreadcrumbView = require('views/pictures/picture_breadcrumb');
var FilteredListView = require('views/filtered_list');

module.exports = FilteredListView.extend({
    
    template: require('templates/pictures/picture_list'),
    
    itemView: PictureItemView,

    tpls: {
        'item': '<li><%=  divider %><a href="#" data-redirect="<%= path %>"><%= label %></a></li>',
        'itemActive': '<li class="active"><%=  divider %><%= label %></li>',
        'divider': '<span class="divider">/</span>'
    },

    onRender: function() {
        this.breadcrumb = new PictureBreadcrumbView( {el: 'ul.breadcrumb'} );
        this.breadcrumb.on('breadcrumb:navigate', this.navigate, this); 
        this.breadcrumb.build(this.options.breadcrumb);
    },

    navigate: function(path) {
        app.router.navigate('#pictures/list-view/' + path, { trigger: true });
    },

    appendHtml: function(cv, iv) {
        this.$('.pictures').append(iv.el);
    }
    
});