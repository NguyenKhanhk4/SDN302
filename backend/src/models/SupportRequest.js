const mongoose = require('mongoose');

const SupportRequestSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    type: {
      type: String,
      enum: ['LEAVE', 'FEEDBACK', 'CONTACT'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề là bắt buộc'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung là bắt buộc'],
      trim: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
    },
    sessionDate: {
      type: Date, // Cho yêu cầu nghỉ học
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'RESOLVED'],
      default: 'PENDING',
    },
    reply: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SupportRequest', SupportRequestSchema);
