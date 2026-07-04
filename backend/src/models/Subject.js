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
    syllabus: {
      type: String, // URL or path to syllabus file
      default: '',
    },
    materials: [{
      type: String, // URLs to material files
    }],
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
