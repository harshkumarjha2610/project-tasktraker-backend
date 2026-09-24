const mongoose = require('mongoose');

const committedIncomeSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    projectTitle: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Committed amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'received', 'cancelled'],
      default: 'pending',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    receivedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

committedIncomeSchema.index({ dueDate: 1 });
committedIncomeSchema.index({ status: 1 });

module.exports = mongoose.model('CommittedIncome', committedIncomeSchema);
