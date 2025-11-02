import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  cottageId: { type: String, ref: 'Cottage', required: true },
  userUsername: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adults: { type: Number, required: true, min: 1 },
  children: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true },
  nights: { type: Number, required: true },
  specialRequests: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'expired'], 
    default: 'pending' 
  },
  rating: {
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    ratedAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
reservationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Reservation', reservationSchema, 'reservations');
