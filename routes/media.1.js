var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const conn = require('../mongoConnection').conn;
const mongoURI = require('../mongoConnection').url;

let gfs;
//create grid stream
conn.once('open',()=>{
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('mediauploads');
});

//create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'mediauploads'
        };
        resolve(fileInfo);
      });
    });
  }
});
const upload = multer({ storage });


router.post('/', upload.single('file'), (req,res,next)=>{
    return res.status(201).json({file: req.file});
    // res.redirect('/');
});

router.get('/files', (req,res,next)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length === 0){
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        return res.status(200).json(files);
    });
});


router.get('/files/:filename', (req,res,next)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        return res.json(file);
    });
});

router.get('/image/:filename', (req,res,next)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
        if(!file || file.length === 0){
            return res.status(404).json({
                err: 'No file exists'
            });
        }
        // return res.json(file);
        //Check if image
        if(file.contentType === 'image/png' || file.contentType === 'image/jpeg'){
            //Read output to browser
            const readStream = gfs.createReadStream(file.filename);
            readStream.pipe(res);            
        }
        else{
            res.status(404).json({
                err:'Not an image!!'
            })
        }
    });
});

router.get('/',(req, res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length === 0){
            return res.status(200).render('index',{files:false});
        }
        else{
            files.map(file=>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage = true;
                }
                else{
                    file.isImage = false;
                }
            });
            // res.render('index',{files:files});
            return res.status(200).json({files:files});
        }
    });    
});

router.delete('/files/:id',(req,res)=>{
    gfs.remove({_id:req.params.id,root:'mediauploads'},(err,gridStore)=>{
        if(err){
            return res.status(404).json({
                err:err
            });            
        }
        // res.redirect('/');
        return res.status(200).json({delete:'success'});
    });
});


module.exports = router;