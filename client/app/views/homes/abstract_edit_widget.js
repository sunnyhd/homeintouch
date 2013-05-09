var StyleConfigurationView = require('views/settings/style_settings');

module.exports = StyleConfigurationView.extend({

    template: "#edit-widget-style-template",

    events: {
        "click .cancel.btn": "cancelClicked",
        "click .edit.btn": "editClicked"
    },

    serializeData: function(){

        var data = StyleConfigurationView.prototype.serializeData.apply(this);

        data.bodyFields = this.model.get("bodyFields");
        data.titleFields = this.model.get("titleFields");

        this.addStyleValues(data.bodyFields, this.model.get("bodyConfiguration"));
        this.addStyleValues(data.titleFields, this.model.get("titleConfiguration"));

        return data;
    },

    getFormFields: function() {
        return _.union(_.pluck(this.model.get("titleFields"), 'id'),
                       _.pluck(this.model.get("bodyFields"), 'id'));
    },

    updateModel: function(data) {
        this.updateStyleConfiguration(data, this.model.bodyPrefix, this.model.bodySelector, "bodyConfiguration");
        this.updateStyleConfiguration(data, this.model.titlePrefix, this.model.titleSelector, "titleConfiguration");
    },

    editClicked: function(e){
        e.preventDefault();

        var formFields = this.getFormFields();

        var data = Backbone.FormHelpers.getFormData(this, formFields);

        this.updateModel(data);

        this.result = {
            status: "OK"
        }

        this.close();
    }
});