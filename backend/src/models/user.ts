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
  role:       { type: String, enum: ['tourist', 'owner', 'admin'], default: 'tourist' },
  active:     { type: Boolean, default: false },        // true after admin approval
  pending:    { type: Boolean, default: true }          // awaiting admin
});


export default mongoose.model('User', userSchema, 'users');