const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: 'default_user',
      unique: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: String,
      default: '',
    },
    activeDates: {
      type: [String],
      default: [],
    },
    totalDaysActive: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Streak', streakSchema);
