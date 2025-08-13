import { url } from 'inspector';
import mongoose, { mongo } from 'mongoose'


const VikendicaSchema = new mongoose.Schema({
    Ocena : Number,
    Description :{type:String,required:true},
    OwnerUsername : {type:String,required:true},
    Title:{type:String,required:true},
    Location:{type:{lng:Number,lat:Number},required:true},
    PriceSummer:{type:Number,required:true},
    PriceWinter:{type:Number,required:true},
    Media:{type:[{
      url: { type: String, required: true },  // link to file
      type: { type: String, enum: ['image', 'video'], required: true }
    }]}
});

export default mongoose.model("Vikendica",VikendicaSchema);