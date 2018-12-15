var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var addressRouter = require('./routes/address');
var categoryRouter = require('./routes/category');
var subCategoryRouter = require('./routes/subCategory');
var sectionalCategoryRouter = require('./routes/sectionalCategory');
var brandRouter = require('./routes/brand');
var productRouter = require('./routes/product');
var mediaRouter = require('./routes/media');
var publicRouter = require('./routes/publicApi');
var bannerRouter = require('./routes/banner');
var tagsRouter = require('./routes/tags');

var conn = require('./mongoConnection').conn;
var app = express();
//app.use(cors());
var os = require('os');
var ifaces = os.networkInterfaces();
var ip = '';
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }
    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
    ip = iface.address;
      //console.log(ifname + ':' + alias, iface.address);
    } else {
      // this interface has only one ipv4 adress
    ip = iface.address;
      //console.log(ifname, iface.address);
    }
    ++alias;
  });
});
console.log('got ip as : ', ip);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
    next();
});

app.use('/', indexRouter);
app.use('/api/user', usersRouter);
app.use('/api/address', addressRouter);
app.use('/api/category', categoryRouter);
app.use('/api/subcategory', subCategoryRouter);
app.use('/api/sectionalCategory', sectionalCategoryRouter);
app.use('/api/brand', brandRouter);
app.use('/api/product', productRouter);
app.use('/api/media', mediaRouter);
app.use('/api/public', publicRouter);
app.use('/api/banner', bannerRouter);
app.use('/api/tags', tagsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;