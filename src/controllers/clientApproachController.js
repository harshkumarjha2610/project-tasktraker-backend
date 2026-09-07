const ClientApproach = require('../models/ClientApproach');

// GET all client approaches
exports.getApproaches = async (req, res, next) => {
  try {
    const approaches = await ClientApproach.find().sort({ date: -1 });
    res.json({ success: true, count: approaches.length, data: approaches });
  } catch (error) {
    next(error);
  }
};

// CREATE a client approach
exports.createApproach = async (req, res, next) => {
  try {
    const approach = await ClientApproach.create(req.body);
    res.status(201).json({ success: true, data: approach });
  } catch (error) {
    next(error);
  }
};

// UPDATE a client approach
exports.updateApproach = async (req, res, next) => {
  try {
    const approach = await ClientApproach.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!approach) {
      return res.status(404).json({ success: false, message: 'Client approach record not found' });
    }
    res.json({ success: true, data: approach });
  } catch (error) {
    next(error);
  }
};

// DELETE a client approach
exports.deleteApproach = async (req, res, next) => {
  try {
    const approach = await ClientApproach.findByIdAndDelete(req.params.id);
    if (!approach) {
      return res.status(404).json({ success: false, message: 'Client approach record not found' });
    }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
