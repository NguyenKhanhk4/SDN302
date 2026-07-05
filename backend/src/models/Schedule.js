const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['0', '1', '2', '3', '4', '5', '6'],
      required: true,
    },
    startTime: {
      type: String, // Định dạng "HH:MM", ví dụ: "08:00"
      required: true,
    },
    endTime: {
      type: String, // Định dạng "HH:MM", ví dụ: "10:00"
      required: true,
    },
    room: String,
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);
