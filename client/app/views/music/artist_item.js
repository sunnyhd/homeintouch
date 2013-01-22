var app = require('app');
var ArtistDetailView = require('views/music/artist_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_item'),

    iconNoImg: app.getBackgroundIcon('media.defaultMovie', '#333333'),

    events: {
        'click .musicContainer': 'show'
    },

    show: function() {
        app.router.navigate('#music/artists/' + this.model.get('movieid'), {trigger: true});
        var view = new ArtistDetailView({ model: this.model });
        app.modal.show(view);
    },

    onRender: function() {
        var $noImgContainer = this.$el.find('.no-img');
        if ($noImgContainer.length > 0) {
            app.applyBackgroundIcon($noImgContainer, this.iconNoImg);
        }
    }
    
});