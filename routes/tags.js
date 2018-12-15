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
var Tags = require('../models/tags');

/* GET Tags listing. */
router.get('/', function(req, res, next) {
    logger.info('in get Tags');
    var decoded = jwt.decode(req.header('Authorization'));
    logger.info('decoded: ' + JSON.stringify(decoded));

    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    Tags.find({}, function(err, tags) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            data: tags
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
    Tags.findOne({_id:req.params.id}, function(err, tag) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: tag
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

    Tags.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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

    if(name && identifier){
        
        var thename =  '^'+name+'$';
        Tags.findOne({name:{'$regex': thename,$options:'i'}}, function(err, tag) {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred 1',
                    error: err
                });
            }
            else if (tag) {
                return res.status(500).json({
                    title: 'An error occurred 2',
                    error: {message: 'Tags with name '+req.body.name+' already exists'}
                });
            }
            else{
                
                var tag = new Tags({name,identifier,isEnabled});
                tag.save(function(err, result) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    res.status(201).json({
                        message: 'Tag created',
                        obj: result
                    });
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
       
    if(id && name && identifier){
        Tags.findById(id,(err,tag)=>{
            if(!err && tag){
                tag.name = name;
                tag.identifier = identifier;
                tag.isEnabled = isEnabled;

                tag.save(function(err, result) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    res.status(201).json({
                        message: 'Tag updated',
                        obj: result
                    });
                });
            } else {             
                return res.status(400).json({
                    error: 'Tag does not exist and cannot be updated'
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