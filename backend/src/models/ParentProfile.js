const mongoose = require('mongoose');

const ParentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    occupation: String,
    address: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ParentProfile', ParentProfileSchema);
