exports.MenuView = Backbone.Marionette.ItemView.extend({

    className: 'nav',

    tagName: 'ul',

    template: '#media-menu-template'

});

exports.MovieView = Backbone.Marionette.ItemView.extend({
    
    template: '#movie-item-template'
    
});

exports.MovieLayout = Backbone.Marionette.CompositeView.extend({
    
    template: '#movie-layout-template',
    
    itemView: exports.MovieView,
    
    appendHtml: function(cv, iv) {
        this.$('.movies').append(iv.el);
    }
    
});