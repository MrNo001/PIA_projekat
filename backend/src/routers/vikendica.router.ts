import { Router } from "express";
import express from "express";
import VikendiceController from "../controllers/vikendice.controller"
import multer from "multer"
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const vikendicaRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cottages/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


vikendicaRouter.get("/getAll",(req,res)=>{VikendiceController.getAllVikendice(req,res)});

vikendicaRouter.get("/test",(req,res)=>{res.json({message:"Access point available"});});

vikendicaRouter.post("/insertCottage",upload.array('photos',5),(req,res) => {VikendiceController.insertCottage(req,res)});

vikendicaRouter.get("/getById/:vikendica",(req,res) => {VikendiceController.getVikendica(req,res)});

vikendicaRouter.get("/owner/:ownerId",(req,res) => {VikendiceController.getCottageByID(req,res)});

vikendicaRouter.put("/update",upload.array('photos',5),(req,res) => {VikendiceController.updateCottage(req,res)});

vikendicaRouter.delete("/:cottageId",(req,res) => {VikendiceController.deleteCottage(req,res)});


export default vikendicaRouter;