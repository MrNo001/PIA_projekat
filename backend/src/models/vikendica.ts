import mongoose from 'mongoose'

const VikendicaSchema = new mongoose.Schema({
    Ocena: { type: Number, default: -1 },
    Description: { type: String, required: true },
    OwnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    Title: { type: String, required: true },
    Location: { 
        type: { 
            lng: { type: Number, required: true }, 
            lat: { type: Number, required: true } 
        }, 
        required: true 
    },
    PriceSummer: { type: Number, required: true },
    PriceWinter: { type: Number, required: true },
    Photos: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
VikendicaSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export default mongoose.model("Vikendica", VikendicaSchema);