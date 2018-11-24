var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
var Media = require('../models/media');
const uploadDir = path.join(__dirname,'../uploads/');
let logger = require('../utils/logger');

var store = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, './uploads');
    },
    filename:function(req,file,cb){
        cb(null, Date.now()+'.'+file.originalname);
    }
});


var upload = multer({storage:store}).single('file');

router.get('/', function(req, res, next) {
    logger.info('in get call of Media');
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
   Media.find({}, function(err, medias) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: medias
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
   Media.findOne({_id:req.params.id}, function(err, media) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: media
      });
  });
  
});

router.post('/', function(req,res,next){
    upload(req,res,function(err){
        if(err){
            return res.status(501).json({error:err});
        }
        var media = new Media({            
            originalfileName: req.file.originalname,
            uploadfileName: req.file.filename,
            mimetype: req.file.mimetype,
            size:req.file.size
        })
        //do all database record saving activity
        
        media.save(function(err, result) {
            if (err) {
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            }
            res.status(201).json({
                message: 'media created',
                obj: result
            });
        });
        // console.log('File uploaded: ', req.file);
        // return res.status(201).json({originalname:req.file.originalname, uploadname:req.file.filename});
    });
});


// router.get('/files', (req,res,next)=>{
//     gfs.files.find().toArray((err,files)=>{
//         if(!files || files.length === 0){
//             return res.status(404).json({
//                 err: 'No files exist'
//             });
//         }
//         return res.status(200).json(files);
//     });
// });

router.delete('/files/:id', function(req, res, next) {
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }

    
    Media.findOne({_id:req.params.id}, function(err, media) {
        logger.info('err 1:', err);        
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if(!Boolean(media)){
            return res.status(400).json({
                title: 'Media does not exist',
                error: null
            });
        }
        logger.info('media exist : ' + JSON.stringify(media));
        fs.unlink(uploadDir+media.uploadfileName,(err)=>{
            logger.info('err 2:' +  err);
            if(err){                
                return res.status(500).json({
                    title: 'An error occurred',
                    error: err
                });
            } else {
                logger.info('Media unlinked success');
                Media.remove({ _id: media.id }, function(err,result){
                    logger.info('err 3:' + err);
                    if (err) {
                        return res.status(500).json({
                            title: 'An error occurred',
                            error: err
                        });
                    } else {
                        logger.info('Media removed success : ' + JSON.stringify(result));
                        return res.status(200).json({
                            message: 'File delete success'
                        });
                    }
                });            
            }
        });
    });
    // uploadfileName
    // Media.remove({ _id: req.params.id }, function(err,result){
    //     if (err) {
    //         return res.status(500).json({
    //             title: 'An error occurred',
    //             error: err
    //         });
    //     }
    //     //Unlink the file
    //     // fs.unlink(lib.baseDir+dir+'/'+filename+'.json',(err)=>{
    //     //     callback(err);
    //     // });
    //     res.status(200).json({
    //         data: result
    //     });
    // });
});

router.get('/download/:filename', function(req,res,next){
    if(req.params.filename){
        logger.info('over here filename:', req.params.filename);
    }    
    filepath = path.join(__dirname,'../uploads') +'/'+ req.params.filename;
    res.sendFile(filepath);
});
router.post('/download/:filename', function(req,res,next){
    if(req.params.filename){
        logger.info('over here filename:', req.params.filename);
    }
    
    // res.status(200).json({
    //     message: 'media created',
    //     obj: {}
    // });
    filepath = path.join(__dirname,'../uploads') +'/'+ req.body.filename;
    res.sendFile(filepath);
});


module.exports = router;