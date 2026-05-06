const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  encryptedData: {
    type: Buffer,
    required: true
  },
  iv: {
    type: Buffer,
    required: true
  },
  authTag: {
    type: Buffer,
    required: true
  },
  fileSize: {
    type: Number
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', FileSchema);