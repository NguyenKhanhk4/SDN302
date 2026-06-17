const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên môn học là bắt buộc'],
      trim: true,
    },
    description: String,
    gradeLevel: String,
    defaultTuitionFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subject', SubjectSchema);
