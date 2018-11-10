var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
    var decoded = jwt.decode(req.header('Authorization'));        
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    } 
    //User.find({ userType: { $ne: 'Admin' } }, function(err, users) {
    User.find({}, function(err, users) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: users
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
   User.findOne({_id:req.params.id}, function(err, user) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: user
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
    User.remove({ _id: req.params.id }, function(err,result){
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
    // var decoded = jwt.decode(req.header('Authorization'));        
    // if(!decoded){
    //     return res.status(401).json({
    //         title: 'Not Authenticated',
    //         error: {message: 'Invalid Token!'}
    //     });
    // }
    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: bcrypt.hashSync(req.body.password, 10),
        email: req.body.email,
        userType: req.body.userType
    });
    User.findOne({email: user.email}, function(err, result) {
        if(err){
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if(!result){            
            user.save(function(err, result1) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                // user.findSimilarUserTypes(function(err, users) {
                //     console.log(users); // woof
                // });
                console.log('fullName : ' , result1.fullName);
                User.findByName('Admin', function(err, users) {
                    console.log(users);
                });
                console.log(result1.speak());
                return res.status(201).json({
                    message: 'User created',
                    obj: {
                        firstName: result1.firstName,
                        lastName: result1.lastName,
                        email: result1.email
                    }
                });
            });
        }
        else{
            return res.status(500).json({
                error:{
                    message: 'User already exists'
                }
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
    User.findOne({'_id': req.params.id}, function(err, user) {
        if (err || !user) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if(user){
            user.firstName = (typeof(req.body.firstName) == 'string' && req.body.firstName.trim().length>0)?req.body.firstName.trim():user.firstName;
            user.lastName = (typeof(req.body.lastName) == 'string' && req.body.lastName.trim().length>0)?req.body.lastName.trim():user.lastName;
            user.userType = (typeof(req.body.userType) == 'string' && req.body.userType.trim().length>0)?req.body.userType.trim():user.userType;            

            if(!(req.body.password==user.password || req.body.password.trim().length == 0)){
                user.password = bcrypt.hashSync(req.body.password, 10);
            }
            user.save(function(err, result1) {
                if (err) {
                    return res.status(500).json({
                        title: 'An error occurred',
                        error: err
                    });
                }
                
                return res.status(201).json({
                    message: 'User updated',
                    obj: {
                        firstName: result1.firstName,
                        lastName: result1.lastName,
                        email: result1.email
                    }
                });
            });
        }
    });

});

router.post('/admin-signin', function(req, res, next) {
    console.log('in signin method: ',req.header('Content-Type'));
    User.findOne({email: req.body.email}, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if (!user || !(user && user.userType==='Admin')) {
            return res.status(401).json({
                title: 'Login failed',
                error: {message: 'Invalid login credentials'}
            });
        }
        if (!bcrypt.compareSync(req.body.password, user.password)) {
            return res.status(401).json({
                title: 'Login failed',
                error: {message: 'Invalid login credentials'}
            });
        }
        
        token = jwt.sign({user: user}, 'secret', {expiresIn: 7200});
        console.log('-------------signed in----------------------');
        
        res.status(200).json({
            message: 'Successfully logged in',
            token: token
        });        
    });
});


router.post('/logout',function(req,res,next){
    var token = req.header('Authorization');
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            return res.status(401).json({
                title: 'Not Authenticated',
                error: {message: 'Invalid Token!'}
            });
        }
        res.status(200).json({
            message: 'Successfully logged out'
        });
    });
});

router.get('/logged/user',function(req,res,next){
    var decoded = jwt.decode(req.header('Authorization'));
    if(!decoded){
        return res.status(401).json({
            title: 'Not Authenticated',
            error: {message: 'Invalid Token!'}
        });
    }
    User.findOne({email: decoded.user.email}, function(err, user) {
        if (err) {
            return res.status(500).json({
                title: 'An error occurred',
                error: err
            });
        }
        if(user){
            res.status(200).json({
                message: 'Success',
                obj: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    userType: user.userType
                }
            });
        }
    })
});

module.exports = router;