var mongoose = require('mongoose');
var Category = require('../models/category');
var SubCategory = require('../models/subCategory');
var SectionalCategory = require('../models/sectionalCategory');
var Brand = require('../models/brand');
var Schema = mongoose.Schema;

var mongooseUniqueValidator = require('mongoose-unique-validator');

var schema = new Schema({
    name: {type: String, required: true},
    imageId: {type:String, required: true},
    taggedTo: {type: String, required: true},
    description: {type: String},
    isEnabled: {type: Boolean, required: true},
    rank: {type:String},
    title: {type: String},
    paragraph: {type: String},
    link: {type: String, required: true},
    validUpto: {type: String},
}, { usePushEach: true });

schema.plugin(mongooseUniqueValidator);

module.exports = mongoose.model('Banner', schema);