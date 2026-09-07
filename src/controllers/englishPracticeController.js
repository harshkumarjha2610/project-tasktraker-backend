const EnglishPractice = require('../models/EnglishPractice');

// GET all practice logs
exports.getPracticeLogs = async (req, res, next) => {
  try {
    const logs = await EnglishPractice.find().sort({ date: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// CREATE a practice log
exports.createPracticeLog = async (req, res, next) => {
  try {
    const log = await EnglishPractice.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// UPDATE a practice log
exports.updatePracticeLog = async (req, res, next) => {
  try {
    const log = await EnglishPractice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) {
      return res.status(404).json({ success: false, message: 'Practice log not found' });
    }
    res.json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
};

// DELETE a practice log
exports.deletePracticeLog = async (req, res, next) => {
  try {
    const log = await EnglishPractice.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: 'Practice log not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
