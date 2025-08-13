
const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  name: String,
  type: String, // e.g., "image/png"
  data: Buffer  // or String if you're using base64
});

export default mongoose.model("Photo", PhotoSchema);