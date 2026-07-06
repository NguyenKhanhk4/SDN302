const mongoose = require('mongoose');

const parentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  address: {
    type: String
  },
  occupation: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ParentProfile', parentProfileSchema);
