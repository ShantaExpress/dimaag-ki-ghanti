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
var SectionalCategory = require('../models/sectionalCategory');
var Category = require('../models/category');
var Brand = require('../models/brand');
var Product = require('../models/product');

router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    

    var promises = [
        Brand.findOne({_id: '5b99779144f9dc1e502f414u'}).exec(),
        SubCategory.findOne({_id: '5b996bc2c450aa157081a48f'}).exec()
    ];
    
    // Promise.all(promises).then(function(results) {
    //     console.log(results);
    //     return res.status(200).json({
    //         result: results
    //     });
    // }).catch(function(err){
    //     console.log(err); 
    //     return res.status(500).json({
    //         error: err
    //     });
    // });
    Product.find({}, function(err, products) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            data: products
        });
  });
  
});

router.get('/:id', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    Product.findOne({_id:req.params.id}, function(err, product) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: product
      });
  });
  
});

router.delete('/:id', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    Product.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            data: result
        });
    });    
  
});

router.post('/', function (req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }

    var name = typeof(req.body.name) == 'string' && req.body.name.trim().length>0?req.body.name.trim():false;
    var identifier = typeof(req.body.identifier) == 'string' && req.body.identifier == 'true'?true:false;
    var isEnabled = typeof(req.body.isEnabled) == 'string' && req.body.isEnabled == 'true'?true:false;
    var url = typeof(req.body.url) == 'string' && req.body.url.trim().length>0?req.body.url.trim():false;
    var basePrice = typeof(req.body.basePrice) == 'number' && req.body.basePrice>=0?req.body.basePrice:false;
    var discount = typeof(req.body.discount) == 'number' && req.body.discount>=0?req.body.discount:false;
    var quantity = typeof(req.body.quantity) == 'number' && req.body.quantity>=0?req.body.quantity:false;
    var description = typeof(req.body.description) == 'string' && req.body.description.trim().length>0?req.body.description.trim():false;
    var specification = typeof(req.body.specification) == 'object' && req.body.specification instanceof Array?req.body.specification:false;
    var manufacturer = typeof(req.body.manufacturer) == 'string' && req.body.manufacturer.trim().length>0?req.body.manufacturer.trim():false;
    var seller = typeof(req.body.seller) == 'string' && req.body.seller.trim().length>0?req.body.seller.trim():false;
    var image_id = typeof(req.body.image_id) == 'string' && req.body.image_id.trim().length>0?req.body.image_id.trim():false;
    var category_id = typeof(req.body.category_id) == 'string' && req.body.category_id.trim().length>0?req.body.category_id.trim():false;
    var subCategory_id = typeof(req.body.subCategory_id) == 'string' && req.body.subCategory_id.trim().length>0?req.body.subCategory_id.trim():false;
    var sectionalCategory_id = typeof(req.body.sectionalCategory_id) == 'string' && req.body.sectionalCategory_id.trim().length>0?req.body.sectionalCategory_id.trim():false;
    var brand_id = typeof(req.body.brand_id) == 'string' && req.body.brand_id.trim().length>0?req.body.brand_id.trim():false;
    var tags = typeof(req.body.tags) == 'object' && req.body.tags instanceof Array &&req.body.tags.length ? req.body.tags:[];
    
    if(name && url && basePrice && description && manufacturer && seller && category_id && subCategory_id && sectionalCategory_id && brand_id){
        var promises = [
            Category.findOne({_id:category_id}).exec(),
            SubCategory.findOne({_id:subCategory_id}).exec(),
            SectionalCategory.findOne({_id: sectionalCategory_id}).exec(),
            Brand.findOne({_id: brand_id}).exec()
        ];
          
        Promise.all(promises).then(function(results) {
            if(results && results.length){
                var thename =  '^'+name+'$';
                // db.collection.find({'name': });
                Product.findOne({name:{'$regex': thename,$options:'i'}}, function(err, product) {
        
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred 1',
                            error: err
                        });
                    } else if (product) {
                        return res.status(500).json({
                            title: 'An error occurred 2',
                            error: {message: 'Product with name '+name+' already exists'}
       
                        });
                    }

                    
                    var product = new Product({name, identifier, isEnabled, url, basePrice,quantity, discount,
                                 description, specification, manufacturer, seller, image_id, category_id, subCategory_id, sectionalCategory_id, brand_id, tags});
                    product.save(function(err, productSafed) {
                        if (err) {
                            return res.status(500).json({
                                title: 'An error occurred',
                                error: err
                            });
                        }
                        res.status(201).json({
                            message: 'Product created',
                            obj: productSafed
                        });
                    });

                });
            } else {                               
                return res.status(400).json({
                    error: 'No Matching Brand or Sub Category found'
                });
            }
            // console.log(results);
            // return res.status(200).json({
            //     result: results
            // });
        }).catch(function(err){
            logger.error(err); 
            return res.status(500).json({
                error: err
            });
        });
    } else {                
        return res.status(400).json({
            error: 'Mandatory fields missing'
        });
    }
    
});

router.put('/:id', function (req, res, next) {
   
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }

    var id = typeof(req.body._id) == 'string' && req.body._id.trim().length>0?req.body._id.trim():false;
    var name = typeof(req.body.name) == 'string' && req.body.name.trim().length>0?req.body.name.trim():false;
    var identifier = typeof(req.body.identifier) == 'string' && req.body.identifier == 'true'?true:false;
    var isEnabled = typeof(req.body.isEnabled) == 'boolean' && req.body.isEnabled == true?true:false;
    var url = typeof(req.body.url) == 'string' && req.body.url.trim().length>0?req.body.url.trim():false;
    var basePrice = typeof(req.body.basePrice) == 'number' && req.body.basePrice>=0?req.body.basePrice:false;
    var discount = typeof(req.body.discount) == 'number' && req.body.discount>=0?req.body.discount:false;
    var quantity = typeof(req.body.quantity) == 'number' && req.body.quantity>=0?req.body.quantity:false;
    var description = typeof(req.body.description) == 'string' && req.body.description.trim().length>0?req.body.description.trim():false;
    var specification = typeof(req.body.specification) == 'object' && req.body.specification instanceof Array?req.body.specification:false;
    var manufacturer = typeof(req.body.manufacturer) == 'string' && req.body.manufacturer.trim().length>0?req.body.manufacturer.trim():false;
    var seller = typeof(req.body.seller) == 'string' && req.body.seller.trim().length>0?req.body.seller.trim():false;
    var image_id = typeof(req.body.image_id) == 'string' && req.body.image_id.trim().length>0?req.body.image_id.trim():false;
    var category_id = typeof(req.body.category_id) == 'string' && req.body.category_id.trim().length>0?req.body.category_id.trim():false;
    var subCategory_id = typeof(req.body.subCategory_id) == 'string' && req.body.subCategory_id.trim().length>0?req.body.subCategory_id.trim():false;
    var sectionalCategory_id = typeof(req.body.sectionalCategory_id) == 'string' && req.body.sectionalCategory_id.trim().length>0?req.body.sectionalCategory_id.trim():false;
    var brand_id = typeof(req.body.brand_id) == 'string' && req.body.brand_id.trim().length>0?req.body.brand_id.trim():false;
    var tags = typeof(req.body.tags) == 'object' && req.body.tags instanceof Array &&req.body.tags.length ? req.body.tags:[];
    
    if(id && name && url && basePrice && description && manufacturer && seller && category_id && 
        subCategory_id && sectionalCategory_id && brand_id){
        var promises = [
            Category.findOne({_id:category_id}).exec(),
            SubCategory.findOne({_id:subCategory_id}).exec(),
            SectionalCategory.findOne({_id: sectionalCategory_id}).exec(),
            Brand.findOne({_id: brand_id}).exec(),
            Product.findOne({_id:id})
        ];
          
        Promise.all(promises).then(function(results) {
            if(results && results.length){
                logger.info('results: '+ JSON.stringify(results));
                var product = results[4];
                product.name = name;
                product.identifier = identifier;
                product.isEnabled = isEnabled;
                product.url = url;
                product.basePrice = basePrice;
                product.quantity = quantity;
                product.discount = discount;
                product.description = description;
                product.specification = specification;
                product.manufacturer = manufacturer;
                product.seller = seller;
                product.image_id = image_id;
                product.category_id = category_id;
                product.subCategory_id = subCategory_id;
                product.sectionalCategory_id = sectionalCategory_id;
                product.brand_id = brand_id;
                product.tags = tags;
                product.save(function(err, productSaved) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    res.status(200).json({
                        message: 'Product updated',
                        obj: productSaved
                    });
                });
            } else {                               
                return res.status(400).json({
                    error: 'No Matching Brand or Sub Category found'
                });
            }
        }).catch(function(err){
            logger.error(err); 
            return res.status(500).json({
                error: err
            });
        });
    } else {                
        return res.status(400).json({
            error: 'Mandatory fields missing'
        });
    }
    
});

module.exports = router;
