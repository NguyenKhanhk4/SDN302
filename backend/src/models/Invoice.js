const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  month: {
    type: String, // e.g., '2023-10'
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid'
  },
  paidAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
