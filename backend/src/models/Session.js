const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    originalTeacherId: { // Used when there is a substitute teacher
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
    },
    room: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: mot class chi co 1 session cho moi schedule trong 1 ngay
SessionSchema.index({ classId: 1, scheduleId: 1, sessionDate: 1 }, { unique: true });

module.exports = mongoose.model('Session', SessionSchema);
