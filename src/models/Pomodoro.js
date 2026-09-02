const mongoose = require('mongoose');

const timerSettingsSchema = new mongoose.Schema({
  workDuration: { type: Number, default: 25 },
  shortBreakDuration: { type: Number, default: 5 },
  longBreakDuration: { type: Number, default: 15 },
  longBreakInterval: { type: Number, default: 4 },
  autoStartBreaks: { type: Boolean, default: false },
  autoStartPomodoros: { type: Boolean, default: false },
  soundEnabled: { type: Boolean, default: true },
  tickingEnabled: { type: Boolean, default: true },
  bellEnabled: { type: Boolean, default: true },
  clockStyle: { type: String, default: 'classic' },
}, { _id: false });

const pomodoroSessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  mode: { type: String, enum: ['work', 'shortBreak', 'longBreak'], required: true },
  durationMinutes: { type: Number, required: true },
  taskTitle: { type: String, default: '' },
  completedAt: { type: String, required: true },
}, { _id: false });

const wastedSessionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  mode: { type: String, enum: ['work', 'shortBreak', 'longBreak'], required: true },
  taskTitle: { type: String, default: '' },
  durationSeconds: { type: Number, required: true },
  interruptedAt: { type: String, required: true },
  isOverdueDelay: { type: Boolean, default: false },
}, { _id: false });

const pomodoroSchema = new mongoose.Schema({
  // Single document record identifier if needed
  key: { type: String, default: 'global_pomodoro_store', unique: true },
  settings: { type: timerSettingsSchema, default: () => ({}) },
  colorTheme: { type: String, default: 'purple' },
  bgStyle: { type: String, default: 'default' },
  history: { type: [pomodoroSessionSchema], default: [] },
  wasteHistory: { type: [wastedSessionSchema], default: [] },
  activeTimer: {
    isRunning: { type: Boolean, default: false },
    mode: { type: String, default: 'work' },
    targetEndTimestamp: { type: Number, default: null },
    timeLeft: { type: Number, default: 1500 },
    selectedTaskId: { type: String, default: '' },
    updatedAt: { type: Number, default: () => Date.now() },
  },
  standaloneWasteState: {
    isRunning: { type: Boolean, default: true },
    startedAt: { type: Number, default: null },
    accumulatedMs: { type: Number, default: 0 },
    sessions: { type: Array, default: [] },
    updatedAt: { type: Number, default: () => Date.now() },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Pomodoro', pomodoroSchema);
