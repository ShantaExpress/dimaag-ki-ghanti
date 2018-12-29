var mongoose = require('mongoose');
var SubCategory = require('../models/subCategory');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    identifier: {type: String, required: true},
    isEnabled: {type: Boolean, required: true},
    url:{type:String},
    subCategory_id:{
        type: Schema.Types.ObjectId,
        ref: SubCategory        
    },
    imageName: {type:String}
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('SectionalCategory', schema);