var mongoose = require('mongoose');
var mlabDb = "mongodb://kdcdadmin:kdcd%40123@ds141221.mlab.com:41221/ecommerce";
var localDb = "mongodb://127.0.0.1:27017/ecommerce";
const mongoURI = mlabDb;
// const mongoURI = localDb;
console.log('connecting to : ', mongoURI);
mongoose.connect(mongoURI);
const conn = mongoose.createConnection(mongoURI);


module.exports.conn = conn;
module.exports.url = mongoURI;