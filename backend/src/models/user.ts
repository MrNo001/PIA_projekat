import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username:   { type: String, unique: true, required: true },
  email:      { type: String, unique: true, required: true },
  password:   { type: String, required: true },
  firstName:  String,
  lastName:   String,
  gender:     { type: String, enum: ['M', 'Ž'] },
  address:    String,
  phone:      String,
  creditCard: String,          
  profileImg: { type: String, default: '/uploads/default.png' },
  role:       { type: String, enum: ['tourist', 'owner', 'administrator'], default: 'tourist' },
  isActive:   { type: Boolean, default: false },        // true after admin approval
  pending:    { type: Boolean, default: true },         // awaiting admin
  rejectionReason: String,                               // reason for rejection
  rejectedAt: Date,                                       // when rejected
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


export default mongoose.model('User', userSchema, 'users');