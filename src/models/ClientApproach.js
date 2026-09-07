const mongoose = require('mongoose');

const clientApproachSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    clientName: {
      type: String,
      required: [true, 'Client name or company is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['upwork', 'linkedin', 'email', 'twitter', 'fiverr', 'call', 'other'],
      default: 'linkedin',
    },
    approachType: {
      type: String,
      enum: ['proposal', 'cold_pitch', 'followup', 'call', 'other'],
      default: 'cold_pitch',
    },
    status: {
      type: String,
      enum: ['pending', 'replied', 'meeting', 'converted', 'rejected'],
      default: 'pending',
    },
    dealValue: {
      type: Number,
      default: 0,
      min: [0, 'Deal value cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

clientApproachSchema.index({ date: -1 });
clientApproachSchema.index({ status: 1 });

module.exports = mongoose.model('ClientApproach', clientApproachSchema);
