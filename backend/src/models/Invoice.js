const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    month: {
      type: String, // "YYYY-MM"
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['PAID', 'UNPAID', 'PARTIAL', 'OVERDUE'],
      default: 'UNPAID',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

InvoiceSchema.index({ studentId: 1, classId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
