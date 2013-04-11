var app = require('app');
var PictureDetailView = require('views/pictures/picture_detail');

module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'picture',
    
    template: require('templates/pictures/picture_cover_item'),

    events: {
        'click .pictureContainer': 'show'
    },

    show: function() {
    	if (this.model.get('filetype') === 'directory') {
        	app.router.navigate('#pictures/cover-view/' + this.model.get('file'), {trigger: true});
    	} else {
    		var view = new PictureDetailView({ model: this.model });
        	app.modal.show(view);
    	}
    }
    
});