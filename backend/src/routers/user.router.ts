import express from "express"
import User from "../models/user";


const userRouter = express.Router();


userRouter.get("/getUser/:username",(req,res)=>{
    const username = req.params.username;
    User.findOne({username:username}).then((user)=>{
        res.json(user).status(200);
    }).catch((err) =>{
        console.log(err);
        res.json(err).status(400);
    })
});

export default userRouter;