const mongoose = require('mongoose');

const StudentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    parentName: String,
    parentPhone: String,
    grade: String,
    school: String,
    status: {
      type: String,
      enum: ['active', 'inactive', 'reserved', 'finished'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', StudentProfileSchema);
