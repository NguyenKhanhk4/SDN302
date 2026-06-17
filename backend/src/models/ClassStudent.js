const mongoose = require('mongoose');

const ClassStudentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled',
    },
  },
  {
    timestamps: true,
  }
);

// Tránh việc 1 học sinh tham gia trùng lặp 1 lớp
ClassStudentSchema.index({ classId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('ClassStudent', ClassStudentSchema);
