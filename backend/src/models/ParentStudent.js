const mongoose = require('mongoose');

const parentStudentSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParentProfile',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  relationship: {
    type: String,
    enum: ['father', 'mother', 'guardian', 'other'],
    default: 'other'
  }
}, { timestamps: true });

// Prevent duplicate parent-student links
parentStudentSchema.index({ parentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ParentStudent', parentStudentSchema);
