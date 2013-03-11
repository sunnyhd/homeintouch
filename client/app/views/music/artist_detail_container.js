var ArtistDetailView = require('views/music/artist_detail');
var AlbumListView = require('views/music/artist_album_list');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/music/artist_detail_container'),

    className: 'container-fluid',

    regions: {
        artistDetail: "#artist-detail",
        albumList: "#album-list"
    },

    // Avoid rendering when the music collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var artistDetailView = new ArtistDetailView({ model: this.model });
        this.artistDetail.show(artistDetailView);

        var albumListView = new AlbumListView({ model: this.model, mode: this.options.mode });
        this.albumList.show(albumListView);
    }
});