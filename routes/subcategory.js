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
/* GET subCategories listing. */
router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    SubCategory.find(req.query, function(err, subCategories) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
        data: subCategories
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
   SubCategory.findOne({_id:req.params.id}, function(err, subCategory) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: subCategory
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
    SubCategory.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    var category_id = typeof(req.body.category_id) == 'string' && req.body.category_id.trim().length>0?req.body.category_id.trim():false;
    var imageName = typeof(req.body.imageName) == 'string' && req.body.imageName.trim().length>0?req.body.imageName.trim():'';
    if(name && identifier && category_id){
         
        var thename =  '^'+name.trim()+'$';
        // db.collection.find({'name': });
        SubCategory.findOne({name:{'$regex': thename,$options:'i'}}, function(err, category) {            
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else if (category) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: {message: 'SubCategory with name '+name+' already exists'}
                });
            }
            else{
                Category.findById(category_id,(err,category)=>{
                    if(!err && category){
                        var subCategory = new SubCategory({
                            name,
                            identifier,
                            isEnabled,
                            url: ( url ? url : '/' + identifier),
                            category_id,
                            imageName
                        });            
                        
                        subCategory.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({                           
                                    error: 'Error occured while saving the SubCategory'
                                });
                            }
                            res.status(201).json({
                                message: 'SubCategory created',
                                obj: result
                            });
                        });
                    } else {               
                        return res.status(400).json({
                            error: 'Given Category not found for this request'
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
    var isEnabled = req.body.isEnabled == 'true' || req.body.isEnabled == true?true:false;
    var url = typeof(req.body.url) == 'string' && req.body.url.trim().length>0?req.body.url.trim():false;
    var category_id = typeof(req.body.category_id) == 'string' && req.body.category_id.trim().length>0?req.body.category_id.trim():false;
    var imageName = typeof(req.body.imageName) == 'string' && req.body.imageName.trim().length>0?req.body.imageName.trim():'';

    if(id && name && identifier && category_id){
        SubCategory.findById(id,(err,subCategory)=>{
            if(!err && subCategory){
                subCategory.name = name;
                subCategory.identifier = identifier;
                subCategory.isEnabled = isEnabled;
                subCategory.url = ( url ? url : '/' + identifier);
                subCategory.category_id = category_id;
                subCategory.imageName = imageName;
                
                Category.findById(category_id,(err,category)=>{
                    if(!err && category){
                        subCategory.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({                           
                                    error: 'Error occured while updating the SubCategory'
                                });
                            }
                            res.status(201).json({
                                message: 'SubCategory updated',
                                obj: result
                            });
                        });
                    } else {               
                        return res.status(400).json({
                            error: 'Given Category not found for this request'
                        }); 
                    }
                });
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