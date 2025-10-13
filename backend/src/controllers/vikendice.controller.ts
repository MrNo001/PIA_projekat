import { Router } from "express";
import Vikendica from "../models/vikendica";
import User from "../models/user";
import { Request, Response } from 'express';
import { AuthController } from "./auth.controller";

class VikendiceController{

    static getAllVikendice(req:Request,res:Response){
        Vikendica.find({}).then(
            vikendice => { res.json(vikendice);}
        );
        
    }

    static insertCottage(req:Request,res:Response){
        console.log("Started inserting");
        console.log(req.body);

        let OwnerUsername = req.body.OwnerUsername;
        
        // Find user by username to get their _id
        User.findOne({username: OwnerUsername}).then(user => {
            if (!user) {
                res.status(400).json({message: "User not found"});
                return;
            }

            console.log("Found user:", user._id);

            const files = req.files as Express.Multer.File[] | undefined;
            if(!files || files.length === 0) {
                res.status(400).json({message: "At least one photo is required"});
                return;
            }
            
            const photos = files.map((file: Express.Multer.File) => `/uploads/cottages/${file.filename}`);

            console.log("Photos:", photos);

            const nova_Vikendica = new Vikendica({
                Title: req.body.Title,
                Description: req.body.Description,
                OwnerId: user._id, // Use ObjectId directly
                Location: {lng: req.body.lng, lat: req.body.lat},
                PriceSummer: req.body.PriceSummer,
                PriceWinter: req.body.PriceWinter,
                Photos: photos
            });

            console.log("Creating cottage:", nova_Vikendica);

            nova_Vikendica.save().then(ok => {
                console.log("Cottage saved successfully");
                res.status(201).json({message: "Cottage created successfully", cottage: ok});
            }).catch(err => {
                console.error("Error saving cottage:", err);
                res.status(500).json({message: "Failed to create cottage", error: err.message});
            });

        }).catch(err => {
            console.error("Error finding user:", err);
            res.status(500).json({message: "Failed to authenticate user", error: err.message});
        });
    }


    static getCottageByID(req: Request, res: Response) {
        const cottageId = req.params.cottageId;
    
        Vikendica.findById(cottageId)
            .populate('OwnerId', 'username firstName lastName email phone')
            .then(cottage => {
                if (cottage) {
                    res.status(200).json(cottage);
                } else {
                    res.status(404).json({ message: "Cottage not found" });
                }
            })
            .catch(err => {
                console.error('Error fetching cottage:', err);
                res.status(500).json({ message: "Failed to fetch cottage", error: err.message });
            });
    }


    static getVikendica(req:Request,res:Response){
        let vikendicaId = req.params.vikendica;

        Vikendica.findById(vikendicaId)
            .populate('OwnerId', 'username firstName lastName email phone')
            .then(vikendica=>{
                if (vikendica) {
                    res.json(vikendica).status(200);
                } else {
                    res.json({message:"Vikendica not found"}).status(404);
                }
            }).catch(err=>{
                console.error('Error fetching vikendica:', err);
                res.json({message:"Failed to fetch vikendica"}).status(400);
            })
    }

    static getCottagesByOwner(req:Request,res:Response){
        let ownerId = req.params.ownerId;

        // Use populate to get owner details if needed
        Vikendica.find({OwnerId: ownerId})
            .populate('OwnerId', 'username firstName lastName')
            .then(cottages=>{
                res.json(cottages).status(200);
            }).catch(err=>{
                console.error('Error fetching cottages by owner:', err);
                res.json({message:"Failed to fetch cottages"}).status(400);
            })
    }

    static updateCottage(req:Request,res:Response){
        let cottageId = req.body.cottageId;
        let updateData: any = {
            Title: req.body.Title,
            Description: req.body.Description,
            PriceSummer: req.body.PriceSummer,
            PriceWinter: req.body.PriceWinter,
            Location: {
                lat: req.body.lat,
                lng: req.body.lng
            }
        };

        // Handle photo updates if provided
        const files = req.files as Express.Multer.File[] | undefined;
        if (files && files.length > 0) {
            const photos = files.map((file: Express.Multer.File) => `/uploads/cottages/${file.filename}`);
            updateData.Photos = photos;
        }

        Vikendica.findByIdAndUpdate(cottageId, updateData, { new: true }).then(updatedCottage=>{
            if (updatedCottage) {
                res.json({message:"Cottage updated successfully", cottage: updatedCottage}).status(200);
            } else {
                res.json({message:"Cottage not found"}).status(404);
            }
        }).catch(err=>{
            console.error('Error updating cottage:', err);
            res.json({message:"Failed to update cottage"}).status(400);
        })
    }

    static deleteCottage(req:Request,res:Response){
        let cottageId = req.params.cottageId;

        Vikendica.findByIdAndDelete(cottageId).then(deletedCottage=>{
            if (deletedCottage) {
                res.json({message:"Cottage deleted successfully"}).status(200);
            } else {
                res.json({message:"Cottage not found"}).status(404);
            }
        }).catch(err=>{
            console.error('Error deleting cottage:', err);
            res.json({message:"Failed to delete cottage"}).status(400);
        })
    }

    

}

export default VikendiceController;