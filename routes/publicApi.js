var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
let logger = require('../utils/logger');
var SubCategory = require('../models/subCategory');
var Category = require('../models/category');
var SectionalCategory = require('../models/sectionalCategory');
var Media = require('../models/media');
var User = require('../models/user');
var Brand = require('../models/brand');
var Product = require('../models/product');
var Banner = require('../models/banner');
const uploadDir = path.join(__dirname,'../uploads/');

const Models = {
    'Category': Category,
    'SubCategory': SubCategory,
    'SectionalCategory': SectionalCategory,
    'User': User,
    'Brand': Brand,
    'Media': Media,
    'Banner': Banner
}
/* GET listing of generic api */
router.get('/get/:api', function(req, res, next) {
    // req.params.api
    let model;
    if(!req.params.api || Object.keys(Models).indexOf(req.params.api) == -1){        
        res.status(400).json({
            error: 'Invalid Api'
        });
    }
    let findQuery = req.query;
    findQuery.isEnabled = true;
    console.log('query => ', findQuery);
    Models[req.params.api].find(findQuery, function(err, data) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: data
      });
  });
  
});

/* get banner */
// router.get('/getBanner/:context', function(req, res, next) {
//     const context = req.params.context;
//     Banner.find({'': context})
// });

/* get heading listing */
router.get('/getHeaders', function(req, res, next){
    var promises = [
        Category.find({'isEnabled': true}).exec(),
        SubCategory.find({'isEnabled': true}).exec(),
        SectionalCategory.find({'isEnabled': true}).exec(),
        Brand.find({'isEnabled': true}).exec()
    ];
      
    Promise.all(promises).then(function(results) {
        if(results && results.length){
            let modResults = JSON.parse(JSON.stringify(results));
            let [cats, subCats, sectCats, brands] = modResults;
            subCats = linkParentChild(subCats, sectCats, 'sectionalCategories', 'subCategory_id');
            cats = linkParentChild(cats, subCats, 'subCategories', 'category_id');
            res.status(200).json({
                data: cats
            });
        }
    });
});

function linkParentChild (parent, children, childName, parentName) {
    for (var i = 0; i < parent.length; i++) {
        parent[i][childName] = [];
        for (var j = 0; j < children.length; j++) {
            if (children[j][parentName].toString() === parent[i]._id.toString()){
                parent[i][childName].push(children[j]);
            }
        }
    }
    return parent;
}

module.exports = router;
