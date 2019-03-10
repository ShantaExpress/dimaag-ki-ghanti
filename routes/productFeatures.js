var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var ProductSpecification = require('../models/productSpecification');
/* GET productSpecifications listing. */
router.get('/', function(req, res, next) {
    
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }

    var query = req.query;

    ProductSpecification.find(query, function(err, productSpecifications) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: productSpecifications
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
   ProductSpecification.findOne({_id:req.params.id}, function(err, productSpecification) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: productSpecification
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
    ProductSpecification.remove({ _id: { $in : req.params.id.split(',') }}, function(err,result){
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
    ProductSpecification.findOne({sectionalCategory_id:req.body.sectionalCategory_id}, function(err, productSpecification) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        else if (productSpecification) {
            return res.status(500).json({
                title: 'An error occurred',
                error: {message: 'ProductSpecification with this sectional Category already exists'}
            });
        }
        else{
            var productSpecification = new ProductSpecification({
                name: req.body.name,
                identifier: req.body.identifier,
                specifications: req.body.specifications,
                sectionalCategory_id: req.body.sectionalCategory_id,
            });
            productSpecification.save(function(err, result) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                res.status(201).json({
                    message: 'ProductSpecification created',
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
    console.log('////////////////////////////////////////////////////////////////////////////');
    console.log('req.body : ', req.body);
    console.log('\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\');
    ProductSpecification.updateOne(
        {"_id":req.params.id},
        {$set:{
            name: req.body.name,
            identifier: req.body.identifier,
            specifications: req.body.specifications,
            sectionalCategory_id: req.body.sectionalCategory_id
        }},
        function(err, result) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        res.status(200).json({
            message: 'ProductSpecification updated',
            obj: result
        });
    });
});

module.exports = router;