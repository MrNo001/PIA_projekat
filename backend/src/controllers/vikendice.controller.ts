import { Router } from "express";
import Vikendica from "../models/vikendica";
import { Request, Response } from 'express';

class VikendiceController{

    static getAllVikendice(req:Request,res:Response){
        Vikendica.find({}).then(
            vikendice => { res.json(vikendice);}
        );
        
    }

    static insertCottage(req:Request,res:Response){
        console.log(req.body);
        const nova_Vikendica = new Vikendica({
            Title:req.body.tit,
            Description:req.body.Description,
            Ocena:-1,
            OwnerUsername:req.body.OwnerUsername,
            Location:{lng:req.body.lng,lat:req.body.lat},
            Price:req.body.Price
        });
        nova_Vikendica.save().then(ok => {res.json({message:"Ubacena vikendica"});console.log("Ubacena vikendica");}).catch(err => {console.log(err);});
    }


    static getVikendica(req:Request,res:Response){
        let vikendicaId = req.params.vikendica;

        Vikendica.findOne({id_:vikendicaId}).then(vikendica=>{
            res.json(vikendica).status(200)
        }).catch(err=>{
            res.json({message:"Fail"}).status(400);
        })
    }

    

}

export default VikendiceController;