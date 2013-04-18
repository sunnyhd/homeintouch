var app = require('app');
var Files = require('collections/files');
var PictureListView = require('views/pictures/picture_list');
var PictureCoverView = require('views/pictures/picture_cover_list');
var PictureFilterView = require('views/pictures/picture_filter');
var PictureSelectorListView = require('views/pictures/picture_selector_list');

module.exports = Backbone.Marionette.Layout.extend({

    template: require('templates/pictures/picture_container'),

    regions: {
        filter: "#picture-filter",
        list: "#picture-list"
    },

    // Avoid rendering when the movies collection is reseted.
    initialEvents: function() {},

    onRender: function() {

        var listSelectorView = new PictureSelectorListView({ collection: this.collection });
        app.touchBottomContent.show(listSelectorView);
        listSelectorView.select(this.options.mode);

        this.filterView = new PictureFilterView({ collection: this.collection });
        // this.filterView.on('searchFired', this.performSearch, this);
        this.filter.show(this.filterView);

        if (this.options.mode === 'cover') {
            this.filterView.setCoverBtnActive();
            this.listView = new PictureCoverView({ collection: this.collection });
        } else {
            this.filterView.setListBtnActive();
            this.listView = new PictureListView({ collection: this.collection });
        }

        this.list.show(this.listView);
    },

    refreshFilterPanel: function() {
        this.filterView.refreshCollection();
    }
});