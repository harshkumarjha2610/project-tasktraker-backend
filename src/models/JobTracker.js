const mongoose = require('mongoose');

const jobTrackerSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Job position or title is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['linkedin', 'upwork', 'indeed', 'glassdoor', 'wellfound', 'remoteok', 'email', 'referral', 'other'],
      default: 'linkedin',
    },
    jobType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'freelance', 'internship'],
      default: 'full_time',
    },
    workMode: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote',
    },
    salary: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['wishlist', 'applied', 'screening', 'interview', 'offered', 'rejected', 'accepted'],
      default: 'applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    jobUrl: {
      type: String,
      trim: true,
      default: '',
    },
    contactInfo: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

jobTrackerSchema.index({ appliedDate: -1 });
jobTrackerSchema.index({ status: 1 });
jobTrackerSchema.index({ company: 1, position: 1 });

module.exports = mongoose.model('JobTracker', jobTrackerSchema);
