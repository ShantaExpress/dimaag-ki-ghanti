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
var Banner = require('../models/banner');
var Media = require('../models/media');

/* GET Banners listing. */
router.get('/', function(req, res, next) {
    logger.info('in get banners');
    var decoded = jwt.decode(req.header('Authorization'));
    logger.info('decoded: ' + JSON.stringify(decoded));

    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    Banner.find({}, function(err, banners) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            data: banners
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
    Banner.findOne({_id:req.params.id}, function(err, banner) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: banner
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

    Banner.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    var imageId = typeof(req.body.imageId) == 'string' && req.body.imageId.trim().length>0?req.body.imageId.trim():false;
    var taggedTo = typeof(req.body.taggedTo) == 'string' && req.body.taggedTo.trim().length>0?req.body.taggedTo.trim():false;
    var description = typeof(req.body.description) == 'string' && req.body.description.trim().length>0?req.body.description.trim():false;
    var isEnabled = typeof(req.body.isEnabled) == 'string' && req.body.isEnabled == 'true'?true:false;
    var rank = typeof(req.body.rank) == 'number' && req.body.rank>=0?req.body.rank:null;
    var title = typeof(req.body.title) == 'string' && req.body.title.trim().length>0?req.body.title.trim():false;
    var paragraph = typeof(req.body.paragraph) == 'string' && req.body.paragraph.trim().length>0?req.body.paragraph.trim():false;
    var link = typeof(req.body.link) == 'string' && req.body.link.trim().length>0?req.body.link.trim():false;
    var validUpto = typeof(req.body.validUpto) == 'string' && req.body.validUpto.trim().length>0?req.body.validUpto.trim():false;

    if(name && imageId && taggedTo && isEnabled && link){
        
        var thename =  '^'+name+'$';
        // db.collection.find({'name': });
        Banner.findOne({name:{'$regex': thename,$options:'i'}}, function(err, banner) {

            if (err) {
                return res.status(500).json({
                    title: 'An error occurred 1',
                    error: err
                });
            }
            else if (banner) {
                return res.status(500).json({
                    title: 'An error occurred 2',
                    error: {message: 'Banner with name '+req.body.name+' already exists'}
                });
            }
            else{
                Media.findOne({'uploadfileName': imageId}, function(err, media) {
                    if(err){
                        return res.status(500).json({
                            title: 'An error occurred 3',
                            error: err
                        });
                    }
                    else if(media){
                        var banner = new Banner({name, imageId, taggedTo, description, isEnabled, rank, title, paragraph, link, validUpto});
                        banner.save(function(err, result) {
                            if (err) {
                                return res.status(500).json({
                                    title: 'An error occurred',
                                    error: err
                                });
                            }
                            res.status(201).json({
                                message: 'Banner created',
                                obj: result
                            });
                        });
                    } else {
                        return res.status(400).json({
                            error: 'No Media found for this request'
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
    
    var name = typeof(req.body.name) == 'string' && req.body.name.trim().length>0?req.body.name.trim():false;
    var imageId = typeof(req.body.imageId) == 'string' && req.body.imageId.trim().length>0?req.body.imageId.trim():false;
    var taggedTo = typeof(req.body.taggedTo) == 'string' && req.body.taggedTo.trim().length>0?req.body.taggedTo.trim():false;
    var description = typeof(req.body.description) == 'string' && req.body.description.trim().length>0?req.body.description.trim():false;
    var isEnabled = req.body.isEnabled.toString() == 'true'?true:false;
    var rank = typeof(req.body.rank) == 'string' && req.body.rank.length>0?Number(req.body.rank):null;
    var title = typeof(req.body.title) == 'string' && req.body.title.trim().length>0?req.body.title.trim():false;
    var paragraph = typeof(req.body.paragraph) == 'string' && req.body.paragraph.trim().length>0?req.body.paragraph.trim():false;
    var link = typeof(req.body.link) == 'string' && req.body.link.trim().length>0?req.body.link.trim():false;
    var validUpto = typeof(req.body.validUpto) == 'string' && req.body.validUpto.trim().length>0?req.body.validUpto.trim():false;
   
    if(name && imageId && taggedTo && link){
        Banner.findById(req.params.id,(err,banner)=>{
            if(!err && banner){
                banner.name = name;
                banner.imageId = imageId;
                banner.taggedTo = taggedTo;
                banner.description = description;
                banner.isEnabled = isEnabled;
                banner.rank = rank;
                banner.title = title;
                banner.paragraph = paragraph;
                banner.link = link;
                banner.validUpto = validUpto;

                banner.save(function(err, result) {
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    }
                    res.status(201).json({
                        message: 'banner updated',
                        obj: result
                    });
                });
            } else {             
                return res.status(400).json({
                    error: 'Banner does not exist and cannot be updated'
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