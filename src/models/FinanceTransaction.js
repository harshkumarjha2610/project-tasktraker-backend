const mongoose = require('mongoose');

const financeTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Transaction type is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Other',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cash', 'credit_card', 'debit_card', 'paypal', 'crypto', 'other'],
      default: 'bank_transfer',
    },
  },
  {
    timestamps: true,
  }
);

financeTransactionSchema.index({ date: -1 });
financeTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('FinanceTransaction', financeTransactionSchema);
