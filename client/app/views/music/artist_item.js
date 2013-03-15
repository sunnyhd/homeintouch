var app = require('app');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'artist',
    
    template: require('templates/music/artist_item'),

    iconNoImg: app.getBackgroundIcon('media.defaultArtist', '#333333'),

    events: {
        'click .artistContainer': 'show'
    },

    show: function() {
        app.router.navigate('#music/artists/' + this.model.get('artistid'), {trigger: true});
    },

    onRender: function() {
        var $noImgContainer = this.$el.find('.no-img');
        if ($noImgContainer.length > 0) {
            app.applyBackgroundIcon($noImgContainer, this.iconNoImg);
        }
    }
    
});