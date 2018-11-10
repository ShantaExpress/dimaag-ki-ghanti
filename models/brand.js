var mongoose = require('mongoose');
var SubCategory = require('../models/subCategory');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    identifier: {type: String, required: true},
    isEnabled: {type: Boolean, required: true},
    url:{type:String},   
    subCategories:[{type: Schema.Types.ObjectId,ref: SubCategory}]
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Brand', schema);