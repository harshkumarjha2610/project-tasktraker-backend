const mongoose = require('mongoose');

const PRIORITY_ENUM   = ['super high', 'high', 'medium', 'low'];
const STATUS_ENUM     = ['todo', 'inprogress', 'done'];
const CATEGORY_ENUM   = ['work', 'personal', 'health', 'learning', 'other'];

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITY_ENUM, message: 'Invalid priority value' },
      default: 'medium',
    },
    status: {
      type: String,
      enum: { values: STATUS_ENUM, message: 'Invalid status value' },
      default: 'todo',
    },
    category: {
      type: String,
      enum: { values: CATEGORY_ENUM, message: 'Invalid category value' },
      default: 'work',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    estimatedMinutes: {
      type: Number,
      min: [1, 'Estimated minutes must be at least 1'],
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,        // adds createdAt & updatedAt
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-set completedAt when status changes to 'done'
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'done') {
      this.completedAt = null;
    }
  }
  next();
});

// Indexes for common queries
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Task', taskSchema);
