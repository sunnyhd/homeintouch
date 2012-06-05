module.exports = Backbone.Marionette.Region.extend({

    el: "#modal",

    constructor: function(){
        _.bindAll(this);
        Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
        
        this.on("view:show", this.showModal, this);
        this.on("view:closed", this.hideModal, this);
    },

    showModal: function(view){
        view.close = _.once(view.close);
        view.on("close", this.hideModal, this);

        this.$el.modal({
            keyboard: false,
            backdrop: "static"
        });
    },

    hideModal: function(){
        this.$el.modal('hide');
    }
    
});