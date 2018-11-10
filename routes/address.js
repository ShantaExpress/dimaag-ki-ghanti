var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

var Address = require('../models/address');
/* GET addresses listing. */
router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    console.log('in get api: ' , Address);
   Address.find({}, function(err, addresses) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: addresses
      });
  });
  
});
router.get('/id/:id', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    console.log('in get api: ' , Address);
   Address.findOne({_id:req.params.id}, function(err, address) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: address
      });
  });
  
});

router.delete('/remove/:id', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    console.log('in get api: ' , req.params.id);
    Address.remove({ _id: req.params.id }, function(err,result){
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
    console.log('in post api');
    var address = new Address({
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country
    });
    address.save(function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(201).json({
            message: 'Address created',
            obj: result
        });
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
    console.log('in post api');
     Address.updateOne(
        {"_id":req.params.id},
        {$set:{           
            addressLine1: req.body.addressLine1,
            addressLine2: req.body.addressLine2,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            country: req.body.country
        }},
        function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            message: 'Address updated',
            obj: result
        });
    });
});

module.exports = router;