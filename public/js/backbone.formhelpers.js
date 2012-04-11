Backbone.FormHelpers = (function ($, _) {
    var helpers = {};

    helpers.dataReaders = {
        "default": function ($el) {
            return $el.val();
        },

        checkbox: function ($el) {
            return !!$el.attr("checked");
        }
    };

    var getDataReader = function (type) {
        return helpers.dataReaders[type] || helpers.dataReaders["default"];
    };

    helpers.getFormData = function (view, formFields) {
        var data = {};

        formFields = formFields || view.formFields;

        _.each(formFields, function (field) {
            var $el = view.$("#" + field);
            var id = $el.attr("id");

            var type = $el.attr("type");
            var value = getDataReader(type)($el);

            data[id] = value;
        });

        return data;
    };

    helpers.clearFormData = function (view, formFields) {
        formFields = formFields || view.formFields;

        _.each(formFields, function(field) {
            view.$("#" + field).val('');
        });
    };

    return helpers;
})(jQuery, _);
