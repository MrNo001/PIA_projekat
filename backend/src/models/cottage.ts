import mongoose from 'mongoose'

const CottageSchema = new mongoose.Schema({
    _id: { type: String, required: true ,ref: 'Cottage'},
    Ocena: { type: Number, default: -1 },
    Description: { type: String, required: true },
    OwnerUsername: { type: String, required: true },
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
    isBlocked: { type: Boolean, default: false },
    blockedUntil: Date,
    blockedReason: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
CottageSchema.pre('save', function(next) {
    // @ts-ignore
    this.updatedAt = new Date();
    next();
});

export default mongoose.model('Cottage', CottageSchema,'cottages');

