const mongoose = require('mongoose');

const TutorialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  filename: { type: String, required: true },
  uploader: { type: String }, // Optional: can be used for future authentication
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tutorial', TutorialSchema); 