var mongoose = require('mongoose');
var Category = require('../models/category');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    identifier: {type: String, required: true},
    isEnabled: {type: Boolean, required: true},
    url:{type:String},
    category_id:{
        type: Schema.Types.ObjectId,
        ref: Category        
    } 
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('SubCategory', schema);