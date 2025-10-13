import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  cottageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vikendica', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adults: { type: Number, required: true, min: 1 },
  children: { type: Number, required: true, min: 0 },
  totalPrice: { type: Number, required: true },
  nights: { type: Number, required: true },
  specialRequests: { type: String, maxlength: 500 },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed'], 
    default: 'pending' 
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
