import { Router } from 'express';
import express from 'express'
import { AuthController } from '../controllers/auth.controller.js';

const authRouter = express.Router();

authRouter.route('/register').post(
    (req,res) =>  AuthController.register(req,res)
);

authRouter.route('/login').post(
    (req,res) => AuthController.login(req,res));

authRouter.route('/test').get(
    (req,res)=> { res.json({message:"passed test"});}
)


export default authRouter;