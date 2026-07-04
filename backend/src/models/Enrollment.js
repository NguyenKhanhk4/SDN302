const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'CANCELLED'],
      default: 'PENDING',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// A student cannot enroll in the same class twice with PENDING or APPROVED status
EnrollmentSchema.index({ studentId: 1, classId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
