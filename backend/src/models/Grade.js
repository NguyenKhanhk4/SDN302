const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    gradeItems: [
      {
        title: {
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 10,
        },
        weight: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Tránh trùng lặp điểm của một học sinh trong cùng một lớp học
GradeSchema.index({ studentId: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Grade', GradeSchema);
