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
/* GET subCategories listing. */
router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    SectionalCategory.find({}, function(err, sectionalCategories) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
        data: sectionalCategories
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
   SectionalCategory.findOne({_id:req.params.id}, function(err, sectionalCategory) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: sectionalCategory
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
    SectionalCategory.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    var subCategory_id = typeof(req.body.subCategory_id) == 'string' && req.body.subCategory_id.trim().length>0?req.body.subCategory_id.trim():false;
    var imageName = typeof(req.body.imageName) == 'string' && req.body.imageName.trim().length>0?req.body.imageName.trim():'';
    if(name && identifier && subCategory_id){
         
        var thename =  '^'+name.trim()+'$';
        // db.collection.find({'name': });
        SectionalCategory.findOne({name:{'$regex': thename,$options:'i'}}, function(err, sectionalCategory) {            
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            else if (sectionalCategory) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: {message: 'Sectional-Category with name '+name+' already exists'}
                });
            }
            else{
                SubCategory.findById(subCategory_id,(err,subCategory)=>{
                    if(!err && subCategory){
                        var sectionalCategory = new SectionalCategory({
                            name,
                            identifier,
                            isEnabled,
                            url : (url ? url : '/' + identifier),
                            subCategory_id,
                            imageName
                        });            
                        
                        sectionalCategory.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({                           
                                    error: 'Error occured while saving the SubCategory'
                                });
                            }
                            res.status(201).json({
                                message: 'SectionalCategory created',
                                obj: result
                            });
                        });
                    } else {               
                        return res.status(400).json({
                            error: 'Given Sub Category not found for this request'
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
    var subCategory_id = typeof(req.body.subCategory_id) == 'string' && req.body.subCategory_id.trim().length>0?req.body.subCategory_id.trim():false;
    var imageName = typeof(req.body.imageName) == 'string' && req.body.imageName.trim().length>0?req.body.imageName.trim():'';

    if(id && name && identifier && subCategory_id){
        SectionalCategory.findById(id,(err,sectionalCategory)=>{
            if(!err && sectionalCategory){
                sectionalCategory.name = name;
                sectionalCategory.identifier = identifier;
                sectionalCategory.isEnabled = isEnabled;
                sectionalCategory.url = (url ? url : '/' + identifier);
                sectionalCategory.subCategory_id = subCategory_id;
                sectionalCategory.imageName = imageName;
                
                SubCategory.findById(subCategory_id,(err,subCategory)=>{
                    if(!err && subCategory){
                        sectionalCategory.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({                           
                                    error: 'Error occured while updating the SectionalCategory'
                                });
                            }
                            res.status(201).json({
                                message: 'SectionalCategory updated',
                                obj: result
                            });
                        });
                    } else {               
                        return res.status(400).json({
                            error: 'Given SubCategory not found for this request'
                        }); 
                    }
                });
            } else {             
                return res.status(400).json({
                    error: 'SectionalCategory does not exist and cannot be updated'
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