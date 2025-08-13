import { Router } from "express"
import express from "express"
const multer  = require('multer')
const path = require('path');
import { Request,Response } from "express";

const upload = multer({dest:'uploads'});

const mediaRouter = express.Router();



// router.get("getMedia/",upload.single('photo'),(req,res)=>{})

mediaRouter.post('/upload', upload.single('file'), function (req:Request, res:Response) {

    const photo = req.file;
    console.log(photo);
    res.json({message:"we did it"});
    
})


export default mediaRouter; 



/* const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder to store uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage }); */ 