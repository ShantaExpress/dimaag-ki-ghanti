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
var Category = require('../models/category');
/* GET categories listing. */
router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
   Category.find({}, function(err, categories) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: categories
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
   Category.findOne({_id:req.params.id}, function(err, category) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: category
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
    Category.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    var thename =  '^'+req.body.name.trim()+'$';
    // db.collection.find({'name': });
    Category.findOne({name:{'$regex': thename,$options:'i'}}, function(err, category) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else if (category) {
            return res.status(500).json({
                title: 'An error occurred',
                error: {message: 'Category with name '+req.body.name+' already exists'}
            });
        }
        else{
            var category = new Category({
                name: req.body.name,
                identifier: req.body.identifier,
                isEnabled: req.body.isEnabled,
                url: req.body.url
            });
            category.save(function(err, result) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                res.status(201).json({
                    message: 'Category created',
                    obj: result
                });
            });
        }
    });
});

router.put('/:id', function (req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
     Category.updateOne(
        {"_id":req.params.id},
        {$set:{           
            name: req.body.name,
            identifier: req.body.identifier,
            isEnabled: req.body.isEnabled,
            url: req.body.url
        }},
        function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            message: 'Category updated',
            obj: result
        });
    });
});

module.exports = router;