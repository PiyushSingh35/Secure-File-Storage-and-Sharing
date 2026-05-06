const mongoose = require('mongoose');
const crypto = require('crypto');

const ShareTokenSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  token: {
    type: String,
    unique: true,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    index: { expires: 0 }  // MongoDB auto-deletes when expired
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: -1  // -1 = unlimited
  }
});

module.exports = mongoose.model('ShareToken', ShareTokenSchema);