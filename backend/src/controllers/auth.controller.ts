import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { Request, Response } from 'express';


const  passRx = /^[A-Za-z](?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,9}$/;
const  cardRx = /^(3(0[0-3]|6|8)\d{12}|5[1-5]\d{14}|(4539|4556|4916|4532|4929|4485|4716)\d{12})$/;

export class AuthController{

  static login = async (req:Request,res:Response) =>{
    let u = req.body.username;
    let p = req.body.password;

    console.log("REQUEST "+ u + " "+ p);
   
    try {
      const user = await User.findOne({username:u});
      
      if(!user){
        res.json(null);
        return;
      }

      const isPasswordValid = await bcrypt.compare(p, user.password);
      
      if(!isPasswordValid){
        res.json(null);
        return;
      }

      if(!user.isActive){
        res.status(403).json({error: "Account is not active. Please wait for administrator approval."});
        console.log("User not active");
        return;
      }
      
      res.json(user.username).status(200);
      console.log("Found the user");
    } catch (err) {
      console.log(err);
      res.json(null);
    }
  }

  static register = async (req:Request,res:Response) =>
  {
      const username = req.body.username;
      const password = req.body.password;
      const email = req.body.email;
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const gender = req.body.gender;
      const address = req.body.address;
      const phone = req.body.phone;
      const creditCard = req.body.creditCard;
      const role = req.body.role;
      const profileImage = req.file ? req.file.filename : 'default.png';

      try {
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = {
          username:username,
          password:hashedPassword,
          email:email,
          firstName:firstName,
          lastName:lastName,
          gender:gender,
          address:address,
          phone:phone,
          creditCard:creditCard,
          role:role,
          profileImg:profileImage
        }

        await new User(user).save();
        res.status(201).json({message:"Registration waiting for admin approval"});
      } catch (err) {
        console.log("Couldnt save user", err);
        res.status(400).json({message:"Failed to register user"});
      }
  }

  static changePassword = async (req:Request,res:Response) => {
    const username = req.body.username;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;

    try {
      const user = await User.findOne({username:username});
      
      if(!user){
        res.status(404).json({message:"User not found"});
        return;
      }

      const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
      
      if(!isOldPasswordValid){
        res.status(401).json({message:"Old password is incorrect"});
        return;
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      const result = await User.findOneAndUpdate(
        { username: username },
        { password: hashedNewPassword },
        { new: true }
      );

      if(!result){
        res.status(404).json({message:"User not found"});
        return;
      }

      res.status(200).json({message:"Password changed successfully"});
    } catch (err) {
      console.log("Error changing password", err);
      res.status(500).json({message:"Failed to change password"});
    }
  }

}