var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    originalfileName: {type: String, required: true},
    uploadfileName: {type: String, required: true},
    mimetype:{type:String},
    size:{type:Number}
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Media', schema);