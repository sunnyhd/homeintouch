
module.exports = Backbone.Marionette.ItemView.extend({

    tagName: 'li',

    className: 'playlist-item',

    template: require('templates/playlists/playlist_item'),

    templateMoreOpt: require('templates/playlists/more_options'),

    events: {
        'click [data-action=play]': 'play',
        'click [data-action=remove]': 'removeFromPlaylist',
        'click [data-action=more]': 'showMoreOptions',
        'click [data-action=swap-up]': 'swapUp',
        'click [data-action=swap-down]': 'swapDown'
    },

    initialize: function() {
        this.bindTo(this.model, 'change:active', this.activeChanged, this);
    },

    onRender: function() {
        this.activeChanged();

        // Hides swap buttons by default
        this.$el.find('.swap-button').hide();
    },

    activeChanged: function() {

        if (this.model.get('active')) {
           this.$el.addClass('active');

           //TODO REMOVE
           this.$el.find('.song-name').prepend('<i class="icon-play icon-white"></li>');
           this.$el.css({'font-weight': 'bold', 'color': '#FFF'});
        } else {
            this.$el.find('.song-name i').remove();
            this.$el.css({'font-weight': 'normal', 'color': ''});
        }
    },

    /**
     * Displays the more options container.
     */
    showMoreOptions: function(e) {

        var $li = this.$el;
        var $moreOpt = $li.find('.more-opts-container');
        var $icon = $li.find('[data-action="more"] i');

        // If is not the current more options opened
        if ( $moreOpt.length == 0 ) {

            // Clear others
            this.trigger('clear-more-opts');

            // Creates the more options container
            $li.append( this.templateMoreOpt.call(this) );

            $icon.removeClass('icon-chevron-down');
            $icon.addClass('icon-chevron-up');
        
        } else {
            $moreOpt.remove();

            $icon.removeClass('icon-chevron-up');
            $icon.addClass('icon-chevron-down');
        }

        // stop propagation
        return false;
    },

    play: function(e) {
        e.preventDefault();
        this.model.play();
    },

    removeFromPlaylist: function(e) {
        e.preventDefault();
        this.model.removeFromPlaylist();

        this.close();
    },

    swapUp: function() {
        this.trigger('swap-up', this.model.id);
        return false;
    }, 

    swapDown: function() {
        this.trigger('swap-down', this.model.id);
        return false;
    }

});