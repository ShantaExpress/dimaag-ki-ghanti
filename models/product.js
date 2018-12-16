var mongoose = require('mongoose');
var Category = require('../models/category');
var SubCategory = require('../models/subCategory');
var SectionalCategory = require('../models/sectionalCategory');
var Brand = require('../models/brand');
var Tags = require('../models/tags');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    identifier: {type: String, required: true},
    isEnabled: {type: Boolean, required: true},
    url: {type:String,required: true},
    basePrice: {type:Number,required: true},
    quantity: {type:Number,required: true},
    discount: {type:Number},
    description:{type:String,required:true},
    specification:{type:Array},
    manufacturer:{type:String,required:true},
    seller:{type:String,required:true},
    image_id: {type:String},
    category_id:{type: Schema.Types.ObjectId,ref: Category,required: true},
    subCategory_id:{type: Schema.Types.ObjectId,ref: SubCategory,required: true},
    sectionalCategory_id:{type: Schema.Types.ObjectId,ref: SectionalCategory,required: true},
    brand_id:{type: Schema.Types.ObjectId,ref: Brand, required: true},
    tags: [{type: Schema.Types.ObjectId,ref: Tags, required: false}]
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Product', schema);