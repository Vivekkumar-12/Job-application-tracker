const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  status: { type: String, enum: ['Applied', 'Interview', 'Offer', 'Rejected'], default: 'Applied' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema); 