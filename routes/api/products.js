const express = require('express');
const bycript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('../../Models/Task');
const Product = require('../../Models/Product');
const File = require('../../Models/File');
const authenticateToken = require('../../MiddleWare/auth');
const router = express.Router();
const {body, validationResult} = require('express-validator');
const multer  = require('multer');


const storage = multer.diskStorage({
     destination: function (req, file, cb) {
       cb(null, './public/data/uploads/')
     },
     filename: function (req, file, cb) {
       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) 
     //   const uniqueSuffix = 'MyMan.jpg';
       cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname)
     }
})
const upload = multer({ storage: storage })
router.post('/uploades',upload.single("file"), async(req,res) =>{
     const fileObj = {
          name : req.file.filename,
          path : req.file.path,
     }
     const uploads = new File(fileObj)
     await uploads.save();
     res.status(201).json(uploads);
          
})
//? API to create a User
router.post(
     '/products',
     [authenticateToken,[body('name' , 'name is required').notEmpty()]],
     async (req,res) => {
     try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
               return res.status(400).json({errors : errors.array()});
          }

          if(req?.user?.type != "admin"){
               return res.status(400).json({message : 'You are not an admin'});
          }

          const id = req.user.id;
          const ProductObj = {
               name : req.body.name,
               desc : req.body.desc ?? "",
               madeIn : req.body.madeIn ?? "",
               price : req.body.price ?? "",
               fileId : req.body.fileId ?? "",
               expireAt : new Date(),
               userId : id,
               //status : 'to-do'
          };

          const product = new Product(ProductObj);
          await product.save();
          if(product?.fileId){
               // await product.populate(File).exec();
               const cretatedProduct = await Product.findById(product._id).populate(['fileId','userId']).exec();
               res.status(201).json(cretatedProduct);
          }
     } catch (error) {
          console.error(error);
          res.status(500).json({message : `Something is worng in the server`});
     }
})


//? API to get Users 
router.get('/tasks',authenticateToken,async(req,res) =>{
     try {
          const  id  = req.user.id;
          const Tasks =  await Task.find({userId: id})
          res.json(Tasks);
          
     } catch (error) {
          res.status(404).json(`User not Found`);
     }
})

//? API to Update a user
router.put('/update/:id',[authenticateToken,[
     body('status' , 'status must be to-do or in-progress or done').isIn(['to-do','in-progress','done']),],],
     async(req,res) =>{
     try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
               return res.status(400).json({errors : errors.array()});
          }

          const id = req.params.id;
          const userId = req.user.id;
          const body = req.body
          const task = await Task.findOneAndUpdate({_id : id , userId : userId},body,{new : true});
          if(task){
               res.json(task);
          }
          else {
               res.status(404).json({message:"Task Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})

//? User Change his Task Status
router.put('/:id',[authenticateToken,[
     body('status' , 'status is required').notEmpty(),
     body('status' , 'status must be to-do or in-progress or done').isIn(['to-do','in-progress','done']),],],
     async(req,res) =>{
     try {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
               return res.status(400).json({errors : errors.array()});
          }

          const id = req.params.id;
          const userId = req.user.id;
          const status = req.body.status;
          const task = await Task.findOneAndUpdate({_id : id , userId : userId},{status : status},{new : true});
          if(task){
               res.json(task);
          }
          else {
               res.status(404).json({message:"Task Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})

//? A user can see one of his created Task
router.get('/:id',authenticateToken,async(req,res) =>{
     try {
          const id =req.params.id;
          const userId =req.user.id;
          const task = await Task.findOne({_id : id , userId : userId});
          if(task){
               res.json(task);
          }
          else{
               res.status(404).json({message:"User Not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }
})



//? A user can delete one of his created Task
router.delete('/users',authenticateToken,async(req,res) =>{
     try {
          const id =req.params.id;
          const userId = req.user.id;
          const task = await Task.findOneAndDelete({_id : id , userId : userId});
          if(task){
               res.status(200).json(task);
          }
          else {
               res.status(404).json({message : "Task is not Found"});
          }
     } catch (error) {
          res.status(500).json({message : `SomeThing wrong in Server`});
     }

})
module.exports = router;