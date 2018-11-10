var mongoose = require('mongoose');
var Category = require('../models/category');
var SubCategory = require('../models/subCategory');
var Brand = require('../models/brand');
var Product = require('../models/products');
var User = require('../models/user');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    user_id: {type: Schema.Types.ObjectId,ref: User,required: true},
    star: {type: Number, required: true},
    comment:{type:String},
    product_id: {type: Schema.Types.ObjectId,ref: Product,required: true},
    date:{type: String, required:true},
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Rating', schema);