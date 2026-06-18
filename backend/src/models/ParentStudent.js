const mongoose = require('mongoose');

const ParentStudentSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    relationship: {
      type: String,
      enum: ['Father', 'Mother', 'Guardian', 'Other'],
      default: 'Guardian',
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

ParentStudentSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ParentStudent', ParentStudentSchema);
