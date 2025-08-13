import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { Request, Response } from 'express';


const  passRx = /^[A-Za-z](?=(?:.*[a-z]){3,})(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{5,9}$/;
const  cardRx = /^(3(0[0-3]|6|8)\d{12}|5[1-5]\d{14}|(4539|4556|4916|4532|4929|4485|4716)\d{12})$/;

export class AuthController{



  static login = (req:Request,res:Response) =>{
    let u = req.body.username;
    let p = req.body.password;

    console.log("REQUEST "+ u + " "+ p);
   
    User.findOne({username:u,password:p}).then((user) => {
      if(user){
        res.json(user.username).status(200);
        console.log("Found the user");
        }
      else{
      res.json(null);
      }
    }).catch((err)=>{
      console.log(err);
      res.json(null);
    });
  }

  static register = (req:Request,res:Response) =>
  {
     /* const {username,password,email,firstName,lastName,gender,address,phone,creditCard,role='tourist'}=req.body; */
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

    

      
      // if(!passRx.test(password)){
      //   res.status(400).json({message:"Wrong password format"});
      //   return;
      // }
      // if(!cardRx.test(creditCard)){
      //   res.status(400).json({messaeg:"Wrong credit card format"});
      //   return;
      // }
      
      //const profileImg = req.file?'/' + req.file.path.replace(/\\/g, '/') : undefined;



      let user = {
        username:username,
        password:password,
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

      new User(user).save().then(ok=>
      {
        res.status(201).json({message:"Registration waiting for admin approval"});
        return;
      }).catch(err => {
        console.log("Couldnt save user");
        res.status(400).json({message:"Failed to register user"});
      });
  }

}



