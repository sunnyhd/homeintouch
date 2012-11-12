
exports.lastN = function(clazz, n, callback) {
    clazz.find().sort('_id', -1).limit(n).exec(callback);
};