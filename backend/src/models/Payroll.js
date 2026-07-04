const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    totalSessions: {
      type: Number,
      default: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
    },
    bonusAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'APPROVED', 'PAID'],
      default: 'DRAFT',
    },
    details: [
      {
        sessionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Session',
        },
        amount: Number,
      }
    ],
  },
  {
    timestamps: true,
  }
);

PayrollSchema.index({ teacherId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
