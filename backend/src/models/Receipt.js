const mongoose = require('mongoose');

const ReceiptSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER'],
      default: 'BANK_TRANSFER',
    },
    transactionId: String, // For bank transfer or online payment reference
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Receipt', ReceiptSchema);
