import express from "express";
import CottagesController from "../controllers/cottages.controller";
import multer from "multer";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const cottageRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/cottage_photos/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

cottageRouter.get("/getAll",(req,res)=>{CottagesController.getAllCottages(req,res)});

cottageRouter.get("/test",(req,res)=>{res.json({message:"Access point available"});});

cottageRouter.post("/insertCottage",upload.array('photos',5),(req,res) => {CottagesController.insertCottage(req,res)});

cottageRouter.get("/getById/:cottageId",(req,res) => {CottagesController.getCottage(req,res)});

cottageRouter.get("/owner/:ownerUsername",(req,res) => {CottagesController.getCottagesByOwner(req,res)});

// New: fetch by username for owner pages
cottageRouter.get("/owner-username/:username",(req,res) => {CottagesController.getCottagesByOwnerUsername(req,res)});

cottageRouter.put("/update",upload.array('photos',5),(req,res) => {CottagesController.updateCottage(req,res)});

cottageRouter.delete("/:cottageId",(req,res) => {CottagesController.deleteCottage(req,res)});

export default cottageRouter;

