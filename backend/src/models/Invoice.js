const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIAL', 'PAID', 'CANCELLED'],
      default: 'UNPAID',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Calculate totalAmount before saving if not set
InvoiceSchema.pre('save', function (next) {
  if (this.isModified('amount') || this.isModified('discount')) {
    this.totalAmount = this.amount - this.discount;
  }
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
