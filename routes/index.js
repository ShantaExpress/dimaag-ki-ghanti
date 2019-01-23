var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.sendFile('index.html');
  res.sendFile(path.resolve(__dirname , '../views/index.html'));
  // res.sendFile(path.resolve(__dirname + '/index.html', '../'));
  // res.send(__dirname);
});

module.exports = router;
