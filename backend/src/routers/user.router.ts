import express from "express"
import User from "../models/user";
import multer from "multer";
import path from "path";


const userRouter = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });


userRouter.get("/getUser/:username",(req,res)=>{
    const username = req.params.username;
    User.findOne({username:username}).then((user)=>{
        res.json(user).status(200);
    }).catch((err) =>{
        console.log(err);
        res.json(err).status(400);
    })
});


userRouter.get("/getAllUsers",(req,res)=>{
    User.find().then((users)=>{
        res.json(users).status(200);
    }).catch((err)=>{
        console.log(err);
        res.json(err).status(400);
    })
});

userRouter.get("/getUserById/:id",(req,res)=>{
    const id = req.params.id;
    User.findById(id).then((user)=>{
        res.json(user).status(200);
    }).catch((err)=>{
        console.log(err);
        res.json(err).status(400);
    })
});

userRouter.patch("/update/:username", upload.single('profileImage'), (req, res) => {
    const username = req.params.username;
    const updateData: any = {};
    
    // Only allow specific fields to be updated (whitelist approach)
    const allowedFields = ['firstName', 'lastName', 'email', 'address', 'phone', 'creditCard'];
    
    allowedFields.forEach(key => {
        if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
            updateData[key] = req.body[key];
        }
    });
    
    // Handle profile image upload
    if (req.file) {
        updateData.profileImg = req.file.filename;
    }
    
    User.findOneAndUpdate({ username: username }, updateData, { new: true }).then((user) => {
        res.json({ user }).status(200);
    }).catch((err) => {
        console.log(err);
        res.json(err).status(400);
    });
});
export default userRouter;