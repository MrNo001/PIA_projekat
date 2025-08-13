import { Router } from "express";
import express from "express";
import VikendiceController from "../controllers/vikendice.controller"

const vikendicaRouter = express.Router();


vikendicaRouter.get("/getAll",(req,res)=>{VikendiceController.getAllVikendice(req,res)});

vikendicaRouter.get("/test",(req,res)=>{res.json({message:"Access point available"});});

vikendicaRouter.get("/insertCottage", (req,res) => {VikendiceController.insertCottage(req,res)});


export default vikendicaRouter;