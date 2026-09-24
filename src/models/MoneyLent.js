const mongoose = require('mongoose');

const moneyLentSchema = new mongoose.Schema(
  {
    borrowerName: {
      type: String,
      required: [true, 'Borrower name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Lent amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dateLent: {
      type: Date,
      default: Date.now,
    },
    expectedReturnDate: {
      type: Date,
      default: null,
    },
    repaidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'repaid'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

moneyLentSchema.index({ dateLent: -1 });
moneyLentSchema.index({ status: 1 });

module.exports = mongoose.model('MoneyLent', moneyLentSchema);
