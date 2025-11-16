import Cottage from "../models/cottage";
import User from "../models/user";
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

class CottagesController{

    static getAllCottages(req:Request,res:Response){
        Cottage.find({}).then(
            cottages => { res.json(cottages);}
        );
        
    }

    static insertCottage(req:Request,res:Response){
        console.log("Started inserting");
        console.log(req.body);

        let OwnerUsername = req.body.OwnerUsername;
        
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
            
            const photos = files.map((file: Express.Multer.File) => file.filename);

            console.log("Photos:", photos);

            let amenities = {
                WiFi: false,
                Kitchen: false,
                Laundry: false,
                Parking: false,
                PetFriendly: false
            };
            
            if (req.body.Amenities) {
                try {
                    const parsedAmenities = typeof req.body.Amenities === 'string' 
                        ? JSON.parse(req.body.Amenities) 
                        : req.body.Amenities;
                    amenities = {
                        WiFi: parsedAmenities.WiFi || false,
                        Kitchen: parsedAmenities.Kitchen || false,
                        Laundry: parsedAmenities.Laundry || false,
                        Parking: parsedAmenities.Parking || false,
                        PetFriendly: parsedAmenities.PetFriendly || false
                    };
                } catch (err) {
                    console.error('Error parsing amenities:', err);
                }
            }

            const newCottage = new Cottage({
                    _id: uuidv4(), 
                Title: req.body.Title,
                Description: req.body.Description,
                OwnerUsername: OwnerUsername, 
                Location: {lng: req.body.lng, lat: req.body.lat},
                PriceSummer: req.body.PriceSummer,
                PriceWinter: req.body.PriceWinter,
                Photos: photos,
                Amenities: amenities
            });

            console.log("Creating cottage:", newCottage);

            newCottage.save().then(ok => {
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
    
        Cottage.findById(cottageId)
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

    static getCottage(req:Request,res:Response){
        const cottageId = req.params.cottageId;
        
        Cottage.findOne({_id: cottageId})
            .then(cottage=>{
                if (cottage) {
                    res.status(200).json(cottage);
                } else {    
                    Cottage.find({})
                        .then(allCottages => {
                            const foundCottage = allCottages.find(c => c._id.toString() === cottageId);
                            if (foundCottage) {
                                res.status(200).json(foundCottage);
                            } else {
                                res.status(404).json({message:"Cottage not found"});
                            }
                        })
                        .catch(err => {
                            console.error('Error fetching all cottages:', err);
                            res.status(400).json({message:"Failed to fetch cottage"});
                        });
                }
            }).catch(err=>{
                console.error('Error fetching cottage:', err);
                res.status(400).json({message:"Failed to fetch cottage"});
            })
    }

    static getCottagesByOwner(req:Request,res:Response){
        let ownerUsername = req.params.ownerUsername;

        Cottage.find({OwnerUsername: ownerUsername})
            .then(cottages=>{
                res.json(cottages).status(200);
            }).catch(err=>{
                console.error('Error fetching cottages by owner:', err);
                res.json({message:"Failed to fetch cottages"}).status(400);
            })
    }

    static getCottagesByOwnerUsername(req:Request,res:Response){
        const username = req.params.username;
        
        Cottage.find({ OwnerUsername: username })
            .then(cottages => res.status(200).json(cottages))
            .catch(err => {
                console.error('Error fetching cottages by username:', err);
                res.status(400).json({ message: 'Failed to fetch cottages' });
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

        if (req.body.Amenities) {
            try {
                const parsedAmenities = typeof req.body.Amenities === 'string' 
                    ? JSON.parse(req.body.Amenities) 
                    : req.body.Amenities;
                updateData.Amenities = {
                    WiFi: parsedAmenities.WiFi || false,
                    Kitchen: parsedAmenities.Kitchen || false,
                    Laundry: parsedAmenities.Laundry || false,
                    Parking: parsedAmenities.Parking || false,
                    PetFriendly: parsedAmenities.PetFriendly || false
                };
            } catch (err) {
                console.error('Error parsing amenities:', err);
            }
        }

        const files = req.files as Express.Multer.File[] | undefined;
        
        const photosToDeleteRaw = req.body.photosToDelete || [];
        const existingPhotosRaw = req.body.existingPhotos || [];
        
        const photosToDelete = Array.isArray(photosToDeleteRaw) ? photosToDeleteRaw : photosToDeleteRaw ? [photosToDeleteRaw] : [];
        const existingPhotos = Array.isArray(existingPhotosRaw) ? existingPhotosRaw : existingPhotosRaw ? [existingPhotosRaw] : [];
        
        const extractFilename = (path: string): string => {
            return path.includes('/') ? path.split('/').pop() || path : path;
        };
        
        const existingPhotoFilenames = existingPhotos.map(extractFilename);
        const photosToDeleteFilenames = photosToDelete.map(extractFilename);
        
        let updatedPhotos = [...existingPhotoFilenames];
        
        if (files && files.length > 0) {
            const newPhotos = files.map((file: Express.Multer.File) => file.filename);
            updatedPhotos = [...updatedPhotos, ...newPhotos];
        }
        
        updatedPhotos = updatedPhotos.filter(photo => !photosToDeleteFilenames.includes(photo));
        
        updateData.Photos = updatedPhotos;

        Cottage.findByIdAndUpdate(cottageId, updateData, { new: true }).then(updatedCottage=>{
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

        Cottage.findByIdAndDelete(cottageId).then(deletedCottage=>{
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

export default CottagesController;

