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
var Brand = require('../models/brand');
/* GET subCategories listing. */
router.get('/', function(req, res, next) {
    logger.info('in get Brands');
    var decoded = jwt.decode(req.header('Authorization'));
    logger.info('decoded: ' + JSON.stringify(decoded));

    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    Brand.find({}, function(err, brands) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            data: brands
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
    Brand.findOne({_id:req.params.id}, function(err, brand) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: brand
      });
  });
  
});

router.delete('/:id', function(req, res, next) {
    
    logger.info('*************************************************************** ' + req.params.id);
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    logger.info('in delete where id is : ' + req.params.id);

    Brand.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    var identifier = typeof(req.body.identifier) == 'string' && req.body.identifier.trim().length>0?req.body.identifier.trim():false;
    var isEnabled = typeof(req.body.isEnabled) == 'string' && req.body.isEnabled == 'true'?true:false;
    var url = typeof(req.body.url) == 'string' && req.body.url.trim().length>0?req.body.url.trim():false;
    var subCategories = typeof(req.body.subCategories) == 'object' && req.body.subCategories instanceof Array ?req.body.subCategories:false;

    if(name && identifier && url && subCategories){
        
        var thename =  '^'+name+'$';
        // db.collection.find({'name': });
        Brand.findOne({name:{'$regex': thename,$options:'i'}}, function(err, brand) {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred 1',
                    error: err
                });
            }
            else if (brand) {
                return res.status(500).json({
                    title: 'An error occurred 2',
                    error: {message: 'Brand with name '+req.body.name+' already exists'}
                });
            }
            else{
                console.log('finding SubCategories: ', subCategories);
                SubCategory.find({
                    '_id': { $in: subCategories }
                }, function(err, subCatAr) {
                    if(err){
                        return res.status(500).json({
                            title: 'An error occurred 3',
                            error: err
                        });
                    }
                    else if(subCatAr && subCatAr.length){
                        console.log('subCatAr: ' , subCatAr);
                        subCategories = subCatAr.map(function(item){return item._id});
                        console.log('finally subCategories:', subCategories);
                        var brand = new Brand({name,identifier,isEnabled,url,subCategories});
                        brand.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: err
                                });
                            }
                            res.status(201).json({
                                message: 'Brand created',
                                obj: result
                            });
                        });
                    } else {
                        return res.status(400).json({
                            error: 'No sub-Categories found for this request'
                        });
                    }
                });
            }

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
    var identifier = typeof(req.body.identifier) == 'string' && req.body.identifier.trim().length>0?req.body.identifier.trim():false;
    var isEnabled = typeof(req.body.isEnabled) == 'string' && req.body.isEnabled == 'true'?true:false;
    var url = typeof(req.body.url) == 'string' && req.body.url.trim().length>0?req.body.url.trim():false;
    var subCategories = typeof(req.body.subCategories) == 'object' && req.body.subCategories instanceof Array?req.body.subCategories:false;
       
    if(id && name && identifier && url && subCategories){
        Brand.findById(id,(err,brand)=>{
            if(!err && brand){
                brand.name = name;
                brand.identifier = identifier;
                brand.isEnabled = isEnabled;
                brand.url = url;
                brand.subCategories = subCategories;

                SubCategory.find({
                    '_id': { $in: subCategories }
                }, function(err, subCatAr) {
                    if(err){
                        return res.status(500).json({
                            title: 'An error occurred 3',
                            error: err
                        });
                    }
                    else if(subCatAr && subCatAr.length){
                        brand.subCategories = subCatAr.map(function(item){return item._id});

                        brand.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: err
                                });
                            }
                            res.status(201).json({
                                message: 'Brand updated',
                                obj: result
                            });
                        });
                    } else {
                        return res.status(400).json({
                            error: 'No sub-Categories found for this request'
                        });
                    }
                });
                // Category.findById(category_id,(err,category)=>{
                //     if(!err && category){
                //         subCategory.save(function(err, result) {
                //             if (err) {
                //                 return res.status(500).json({                           
                //                     error: 'Error occured while updating the SubCategory'
                //                 });
                //             }
                //             res.status(201).json({
                //                 message: 'SubCategory updated',
                //                 obj: result
                //             });
                //         });
                //     } else {               
                //         return res.status(400).json({
                //             error: 'Given Category not found for this request'
                //         }); 
                //     }
                // });
            } else {             
                return res.status(400).json({
                    error: 'SubCategory does not exist an dcannot be updated'
                });
            }
        });
    } else {
        return res.status(400).json({
            error: 'Mandatory fields missing'
        });
    }
});

module.exports = router;