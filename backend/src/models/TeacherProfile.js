const mongoose = require('mongoose');

const TeacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    specialization: [String],
    experienceYears: {
      type: Number,
      default: 0,
    },
    bio: String,
    phoneNumber: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TeacherProfile', TeacherProfileSchema);
