import { Router } from "express";
import express from "express";
import testSchema from "../models/test_model"

const testingRouter = express.Router();

testingRouter.post("/dodajTesting",(req,res)=>{
    const param1 = req.body.param1;
    const param2 = req.body.param2;
    new testSchema({polje1:param1,polje2:param2}).save().then(ok => {
        res.status(200).json({message:"jej radi testing"});
        console.log("Ubacen elem");
    });
});

testingRouter.get("/test",(req,res) => {
    console.log("jupiii radi testing");
    res.json({message:"Radi testing path"});
})

export default testingRouter;