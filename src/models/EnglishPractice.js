const mongoose = require('mongoose');

const englishPracticeSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    practiceType: {
      type: String,
      enum: ['speaking', 'listening', 'reading', 'writing', 'vocabulary'],
      required: [true, 'Practice type is required'],
      default: 'speaking',
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    topic: {
      type: String,
      required: [true, 'Topic or title is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    vocabulary: [
      {
        word: { type: String, trim: true },
        meaning: { type: String, trim: true },
        example: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

englishPracticeSchema.index({ date: -1 });

module.exports = mongoose.model('EnglishPractice', englishPracticeSchema);
