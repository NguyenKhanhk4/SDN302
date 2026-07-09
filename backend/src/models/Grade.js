const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the student's User account
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    gradeType: {
      type: String, // 'Midterm', 'Final', 'Homework', etc.
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
      min: [0, 'Điểm số không thể nhỏ hơn 0'],
      max: [10, 'Điểm số không thể lớn hơn 10'],
    },
    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Tránh việc nhập trùng loại điểm cho cùng 1 học sinh ở 1 lớp
GradeSchema.index({ studentId: 1, classId: 1, gradeType: 1 }, { unique: true });

module.exports = mongoose.model('Grade', GradeSchema);
