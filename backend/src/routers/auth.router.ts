import express from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const authRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

authRouter.post('/register', upload.single('profileImage'), (req, res) => {
  AuthController.register(req, res);
});

authRouter.route('/login').post(
    (req,res) => AuthController.login(req,res));

authRouter.route('/test').get(
    (req,res)=> { res.json({message:"passed test"});}
)


export default authRouter;