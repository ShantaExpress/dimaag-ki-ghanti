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
var Media = require('../models/media');
var User = require('../models/user');
var Brand = require('../models/brand');
const uploadDir = path.join(__dirname,'../uploads/');

const Models = {
    'Category': Category,
    'SubCategory': SubCategory,
    'SectionalCategory': SectionalCategory,
    'User': User,
    'Brand': Brand,
    'Media': Media
}
/* GET categories listing. */
router.get('/get/:api', function(req, res, next) {
    // req.params.api
    let model;
    if(!req.params.api || ['Category', 'SubCategory', 'User', 'Media', 'SectionalCategory', 'Brand'].indexOf(req.params.api) == -1){        
        res.status(400).json({
            error: 'Invalid Api'
        });
    }
    
    Models[req.params.api].find({'isEnabled': true}, function(err, data) {
      if (err) {
          return res.status(500).json({
              title: 'An error occurred',
              error: err
          });
      }
      res.status(200).json({
          data: data
      });
  });
  
});



module.exports = router;
