const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên lớp học là bắt buộc'],
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    room: String,
    maxStudents: {
      type: Number,
      default: 20,
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', ClassSchema);
