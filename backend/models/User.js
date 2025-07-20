const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  profilePhoto: { type: String }, // URL or path to profile photo
  resume: { type: String } // URL or path to resume
});

module.exports = mongoose.model('User', userSchema);
